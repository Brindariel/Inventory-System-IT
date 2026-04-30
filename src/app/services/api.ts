import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-907e223d/api`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`,
};

// Helper function to handle fetch errors
const handleFetchError = async (url: string, error: any, response?: Response) => {
  console.error(`API Error - URL: ${url}`);
  console.error(`Error:`, error);
  
  if (response) {
    console.error(`Status: ${response.status}`);
    try {
      const errorData = await response.json();
      console.error(`Response:`, errorData);
      return errorData;
    } catch {
      console.error(`Response: Could not parse JSON`);
    }
  }
  
  return null;
};

export interface Unit {
  id: string;
  asset_tag: string;
  device_type: string;
  brand: string;
  model: string;
  serial_number: string;
  status: 'available' | 'assigned' | 'under repair' | 'retired';
  created_at: string;
  assignment?: Assignment | null;
  assigned_user?: User | null;
}

export interface User {
  id: string;
  full_name: string;
  department: string;
  email: string;
  contact_number: string;
  created_at: string;
}

export interface Assignment {
  id: string;
  unit_id: string;
  user_id: string;
  assigned_date: string;
  status: 'active' | 'inactive';
}

// Units API
export const getUnits = async (): Promise<Unit[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/units`, { headers });
    if (!response.ok) {
      const error = await handleFetchError(`${API_BASE_URL}/units`, 'Failed to fetch units', response);
      throw new Error(error?.error || 'Failed to fetch units');
    }
    return response.json();
  } catch (error: any) {
    console.error('Network error fetching units:', error);
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Unable to connect to server. Please check if the backend is running.');
    }
    throw error;
  }
};

export const getUnit = async (id: string): Promise<Unit> => {
  const response = await fetch(`${API_BASE_URL}/units/${id}`, { headers });
  if (!response.ok) {
    const error = await handleFetchError(`${API_BASE_URL}/units/${id}`, 'Failed to fetch unit', response);
    throw new Error(error?.error || 'Failed to fetch unit');
  }
  return response.json();
};

export const createUnit = async (unit: Omit<Unit, 'id' | 'created_at' | 'assignment' | 'assigned_user'>): Promise<Unit> => {
  const response = await fetch(`${API_BASE_URL}/units`, {
    method: 'POST',
    headers,
    body: JSON.stringify(unit),
  });
  if (!response.ok) {
    const error = await handleFetchError(`${API_BASE_URL}/units`, 'Failed to create unit', response);
    throw new Error(error?.error || 'Failed to create unit');
  }
  return response.json();
};

export const updateUnit = async (id: string, unit: Partial<Unit>): Promise<Unit> => {
  const response = await fetch(`${API_BASE_URL}/units/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(unit),
  });
  if (!response.ok) {
    const error = await handleFetchError(`${API_BASE_URL}/units/${id}`, 'Failed to update unit', response);
    throw new Error(error?.error || 'Failed to update unit');
  }
  return response.json();
};

export const deleteUnit = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/units/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!response.ok) {
    const error = await handleFetchError(`${API_BASE_URL}/units/${id}`, 'Failed to delete unit', response);
    throw new Error(error?.error || 'Failed to delete unit');
  }
};

// Users API
export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, { headers });
    if (!response.ok) {
      const error = await handleFetchError(`${API_BASE_URL}/users`, 'Failed to fetch users', response);
      throw new Error(error?.error || 'Failed to fetch users');
    }
    return response.json();
  } catch (error: any) {
    console.error('Network error fetching users:', error);
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Unable to connect to server. Please check if the backend is running.');
    }
    throw error;
  }
};

export const createUser = async (user: Omit<User, 'id' | 'created_at'>): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify(user),
  });
  if (!response.ok) {
    const error = await handleFetchError(`${API_BASE_URL}/users`, 'Failed to create user', response);
    throw new Error(error?.error || 'Failed to create user');
  }
  return response.json();
};

export const updateUser = async (id: string, user: Partial<User>): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(user),
  });
  if (!response.ok) {
    const error = await handleFetchError(`${API_BASE_URL}/users/${id}`, 'Failed to update user', response);
    throw new Error(error?.error || 'Failed to update user');
  }
  return response.json();
};

export const deleteUser = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!response.ok) {
    const error = await handleFetchError(`${API_BASE_URL}/users/${id}`, 'Failed to delete user', response);
    throw new Error(error?.error || 'Failed to delete user');
  }
};

// Assignments API
export const assignUnit = async (unit_id: string, user_id: string): Promise<Assignment> => {
  const response = await fetch(`${API_BASE_URL}/assign`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ unit_id, user_id }),
  });
  if (!response.ok) {
    const error = await handleFetchError(`${API_BASE_URL}/assign`, 'Failed to assign unit', response);
    throw new Error(error?.error || 'Failed to assign unit');
  }
  return response.json();
};

export const removeAssignment = async (assignment_id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/assign/${assignment_id}`, {
    method: 'DELETE',
    headers,
  });
  if (!response.ok) {
    const error = await handleFetchError(`${API_BASE_URL}/assign/${assignment_id}`, 'Failed to remove assignment', response);
    throw new Error(error?.error || 'Failed to remove assignment');
  }
};