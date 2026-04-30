import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import type { Context } from "npm:hono";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-907e223d/health", (c: Context) => {
  return c.json({ status: "ok" });
});

// ============================================
// HELPER FUNCTIONS
// ============================================

// Generate unique ID
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get next counter value
const getNextCounter = async (counterName: string): Promise<number> => {
  const key = `counter:${counterName}`;
  const current = await kv.get(key);
  const next = current ? parseInt(current) + 1 : 1;
  await kv.set(key, next.toString());
  return next;
};

// ============================================
// UNITS API
// ============================================

// Get all units with assigned user details
app.get("/make-server-907e223d/api/units", async (c: Context) => {
  try {
    // Get all units
    const unitValues = await kv.getByPrefix("unit:");
    const units = unitValues
      .filter(value => value && typeof value === 'string')
      .map(value => {
        try {
          return JSON.parse(value);
        } catch {
          return null;
        }
      })
      .filter(unit => unit !== null);

    // Get all assignments
    const assignmentValues = await kv.getByPrefix("assignment:");
    const assignments = assignmentValues
      .filter(value => value && typeof value === 'string')
      .map(value => {
        try {
          return JSON.parse(value);
        } catch {
          return null;
        }
      })
      .filter(assignment => assignment !== null);

    // Get all users
    const userValues = await kv.getByPrefix("user:");
    const users = userValues
      .filter(value => value && typeof value === 'string')
      .map(value => {
        try {
          return JSON.parse(value);
        } catch {
          return null;
        }
      })
      .filter(user => user !== null);

    // Combine data
    const unitsWithUsers = units.map(unit => {
      const assignment = assignments.find(a => a.unit_id === unit.id && a.status === "active");
      const assignedUser = assignment ? users.find(u => u.id === assignment.user_id) : null;
      
      return {
        ...unit,
        assignment: assignment || null,
        assigned_user: assignedUser || null,
      };
    });

    return c.json(unitsWithUsers);
  } catch (error) {
    console.error("Error fetching units:", error);
    return c.json({ error: "Failed to fetch units", details: String(error) }, 500);
  }
});

// Get single unit by ID
app.get("/make-server-907e223d/api/units/:id", async (c: Context) => {
  try {
    const id = c.req.param("id");
    const unitData = await kv.get(`unit:${id}`);
    
    if (!unitData) {
      return c.json({ error: "Unit not found" }, 404);
    }

    const unit = JSON.parse(unitData);

    // Get assignment
    const assignmentValues = await kv.getByPrefix("assignment:");
    const assignments = assignmentValues
      .filter(value => value && typeof value === 'string')
      .map(value => {
        try {
          return JSON.parse(value);
        } catch {
          return null;
        }
      })
      .filter(assignment => assignment !== null);
    
    const assignment = assignments.find(a => a.unit_id === id && a.status === "active");

    let assignedUser = null;
    if (assignment) {
      const userData = await kv.get(`user:${assignment.user_id}`);
      if (userData) {
        assignedUser = JSON.parse(userData);
      }
    }

    return c.json({
      ...unit,
      assignment: assignment || null,
      assigned_user: assignedUser,
    });
  } catch (error) {
    console.error("Error fetching unit:", error);
    return c.json({ error: "Failed to fetch unit", details: String(error) }, 500);
  }
});

// Create new unit
app.post("/make-server-907e223d/api/units", async (c: Context) => {
  try {
    const body = await c.req.json();
    const { asset_tag, device_type, brand, model, serial_number, status } = body;

    // Validation
    if (!asset_tag || !device_type || !brand || !model || !serial_number) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const id = generateId();
    const unit = {
      id,
      asset_tag,
      device_type,
      brand,
      model,
      serial_number,
      status: status || "available",
      created_at: new Date().toISOString(),
    };

    await kv.set(`unit:${id}`, JSON.stringify(unit));
    return c.json(unit, 201);
  } catch (error) {
    console.error("Error creating unit:", error);
    return c.json({ error: "Failed to create unit", details: String(error) }, 500);
  }
});

// Update unit
app.put("/make-server-907e223d/api/units/:id", async (c: Context) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    const unitData = await kv.get(`unit:${id}`);
    if (!unitData) {
      return c.json({ error: "Unit not found" }, 404);
    }

    const unit = JSON.parse(unitData);
    const updatedUnit = {
      ...unit,
      ...body,
      id, // Preserve ID
      created_at: unit.created_at, // Preserve creation date
    };

    await kv.set(`unit:${id}`, JSON.stringify(updatedUnit));
    return c.json(updatedUnit);
  } catch (error) {
    console.error("Error updating unit:", error);
    return c.json({ error: "Failed to update unit", details: String(error) }, 500);
  }
});

// Delete unit
app.delete("/make-server-907e223d/api/units/:id", async (c: Context) => {
  try {
    const id = c.req.param("id");
    
    const unitData = await kv.get(`unit:${id}`);
    if (!unitData) {
      return c.json({ error: "Unit not found" }, 404);
    }

    // Delete associated assignments - need to find them by scanning
    const assignmentValues = await kv.getByPrefix("assignment:");
    const assignments = assignmentValues
      .filter(value => value && typeof value === 'string')
      .map(value => {
        try {
          return JSON.parse(value);
        } catch {
          return null;
        }
      })
      .filter(assignment => assignment !== null);
    
    for (const assignment of assignments) {
      if (assignment.unit_id === id) {
        await kv.del(`assignment:${assignment.id}`);
      }
    }

    await kv.del(`unit:${id}`);
    return c.json({ message: "Unit deleted successfully" });
  } catch (error) {
    console.error("Error deleting unit:", error);
    return c.json({ error: "Failed to delete unit", details: String(error) }, 500);
  }
});

// ============================================
// USERS API
// ============================================

// Get all users
app.get("/make-server-907e223d/api/users", async (c: Context) => {
  try {
    console.log("Fetching all users...");
    const userValues = await kv.getByPrefix("user:");
    console.log(`Found ${userValues.length} user values`);
    
    const users = userValues
      .filter(value => value && typeof value === 'string')
      .map(value => {
        try {
          return JSON.parse(value);
        } catch (e) {
          console.error("Failed to parse user value:", value, e);
          return null;
        }
      })
      .filter(user => user !== null);

    console.log(`Successfully parsed ${users.length} users`);
    return c.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return c.json({ error: "Failed to fetch users", details: String(error) }, 500);
  }
});

// Create new user
app.post("/make-server-907e223d/api/users", async (c: Context) => {
  try {
    const body = await c.req.json();
    const { full_name, department, email, contact_number } = body;

    // Validation
    if (!full_name || !email) {
      return c.json({ error: "Missing required fields (full_name, email)" }, 400);
    }

    const id = generateId();
    const user = {
      id,
      full_name,
      department: department || "",
      email,
      contact_number: contact_number || "",
      created_at: new Date().toISOString(),
    };

    await kv.set(`user:${id}`, JSON.stringify(user));
    return c.json(user, 201);
  } catch (error) {
    console.error("Error creating user:", error);
    return c.json({ error: "Failed to create user", details: String(error) }, 500);
  }
});

// Update user
app.put("/make-server-907e223d/api/users/:id", async (c: Context) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    const userData = await kv.get(`user:${id}`);
    if (!userData) {
      return c.json({ error: "User not found" }, 404);
    }

    const user = JSON.parse(userData);
    const updatedUser = {
      ...user,
      ...body,
      id, // Preserve ID
      created_at: user.created_at, // Preserve creation date
    };

    await kv.set(`user:${id}`, JSON.stringify(updatedUser));
    return c.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return c.json({ error: "Failed to update user", details: String(error) }, 500);
  }
});

// Delete user
app.delete("/make-server-907e223d/api/users/:id", async (c: Context) => {
  try {
    const id = c.req.param("id");
    
    const userData = await kv.get(`user:${id}`);
    if (!userData) {
      return c.json({ error: "User not found" }, 404);
    }

    // Check if user has active assignments
    const assignmentValues = await kv.getByPrefix("assignment:");
    const assignments = assignmentValues
      .filter(value => value && typeof value === 'string')
      .map(value => {
        try {
          return JSON.parse(value);
        } catch {
          return null;
        }
      })
      .filter(assignment => assignment !== null);
    
    const activeAssignments = assignments.filter(a => a.user_id === id && a.status === "active");
    
    if (activeAssignments.length > 0) {
      return c.json({ error: "Cannot delete user with active assignments" }, 400);
    }

    // Delete all assignments for this user
    for (const assignment of assignments) {
      if (assignment.user_id === id) {
        await kv.del(`assignment:${assignment.id}`);
      }
    }

    await kv.del(`user:${id}`);
    return c.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return c.json({ error: "Failed to delete user" }, 500);
  }
});

// ============================================
// ASSIGNMENTS API
// ============================================

// Assign unit to user
app.post("/make-server-907e223d/api/assign", async (c: Context) => {
  try {
    const body = await c.req.json();
    const { unit_id, user_id } = body;

    // Validation
    if (!unit_id || !user_id) {
      return c.json({ error: "Missing unit_id or user_id" }, 400);
    }

    // Verify unit exists
    const unitData = await kv.get(`unit:${unit_id}`);
    if (!unitData) {
      return c.json({ error: "Unit not found" }, 404);
    }

    // Verify user exists
    const userData = await kv.get(`user:${user_id}`);
    if (!userData) {
      return c.json({ error: "User not found" }, 404);
    }

    // Deactivate existing assignments for this unit
    const assignmentValues = await kv.getByPrefix("assignment:");
    const assignments = assignmentValues
      .filter(value => value && typeof value === 'string')
      .map(value => {
        try {
          return JSON.parse(value);
        } catch {
          return null;
        }
      })
      .filter(assignment => assignment !== null);
    
    for (const assignment of assignments) {
      if (assignment.unit_id === unit_id && assignment.status === "active") {
        assignment.status = "inactive";
        await kv.set(`assignment:${assignment.id}`, JSON.stringify(assignment));
      }
    }

    // Create new assignment
    const id = generateId();
    const assignment = {
      id,
      unit_id,
      user_id,
      assigned_date: new Date().toISOString(),
      status: "active",
    };

    await kv.set(`assignment:${id}`, JSON.stringify(assignment));

    // Update unit status to "assigned"
    const unit = JSON.parse(unitData);
    unit.status = "assigned";
    await kv.set(`unit:${unit_id}`, JSON.stringify(unit));

    return c.json(assignment, 201);
  } catch (error) {
    console.error("Error creating assignment:", error);
    return c.json({ error: "Failed to create assignment", details: String(error) }, 500);
  }
});

// Update assignment (reassign)
app.put("/make-server-907e223d/api/assign/:id", async (c: Context) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    const assignmentData = await kv.get(`assignment:${id}`);
    if (!assignmentData) {
      return c.json({ error: "Assignment not found" }, 404);
    }

    const assignment = JSON.parse(assignmentData);
    
    // If changing user, verify new user exists
    if (body.user_id && body.user_id !== assignment.user_id) {
      const userData = await kv.get(`user:${body.user_id}`);
      if (!userData) {
        return c.json({ error: "User not found" }, 404);
      }
    }

    const updatedAssignment = {
      ...assignment,
      ...body,
      id, // Preserve ID
    };

    await kv.set(`assignment:${id}`, JSON.stringify(updatedAssignment));
    return c.json(updatedAssignment);
  } catch (error) {
    console.error("Error updating assignment:", error);
    return c.json({ error: "Failed to update assignment", details: String(error) }, 500);
  }
});

// Remove assignment
app.delete("/make-server-907e223d/api/assign/:id", async (c: Context) => {
  try {
    const id = c.req.param("id");
    
    const assignmentData = await kv.get(`assignment:${id}`);
    if (!assignmentData) {
      return c.json({ error: "Assignment not found" }, 404);
    }

    const assignment = JSON.parse(assignmentData);
    
    // Update unit status to "available"
    const unitData = await kv.get(`unit:${assignment.unit_id}`);
    if (unitData) {
      const unit = JSON.parse(unitData);
      unit.status = "available";
      await kv.set(`unit:${assignment.unit_id}`, JSON.stringify(unit));
    }

    await kv.del(`assignment:${id}`);
    return c.json({ message: "Assignment removed successfully" });
  } catch (error) {
    console.error("Error removing assignment:", error);
    return c.json({ error: "Failed to remove assignment", details: String(error) }, 500);
  }
});

Deno.serve(app.fetch);