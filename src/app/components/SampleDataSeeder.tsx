import { useState } from 'react';
import { createUnit, createUser, assignUnit } from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Database } from 'lucide-react';
import { toast } from 'sonner';

export function SampleDataSeeder() {
  const [seeding, setSeeding] = useState(false);

  const seedSampleData = async () => {
    try {
      setSeeding(true);
      toast.info('Seeding sample data...');

      // Create sample users first
      const users = await Promise.all([
        createUser({
          full_name: 'John Smith',
          department: 'IT Department',
          email: 'john.smith@company.com',
          contact_number: '+1-555-0101',
        }),
        createUser({
          full_name: 'Sarah Johnson',
          department: 'Marketing',
          email: 'sarah.johnson@company.com',
          contact_number: '+1-555-0102',
        }),
        createUser({
          full_name: 'Michael Chen',
          department: 'Finance',
          email: 'michael.chen@company.com',
          contact_number: '+1-555-0103',
        }),
      ]);

      // Create sample units
      const units = await Promise.all([
        createUnit({
          asset_tag: 'LAPTOP-001',
          device_type: 'laptop',
          brand: 'Dell',
          model: 'Latitude 5520',
          serial_number: 'DLL-SN-001234',
          status: 'available',
        }),
        createUnit({
          asset_tag: 'LAPTOP-002',
          device_type: 'laptop',
          brand: 'HP',
          model: 'EliteBook 840',
          serial_number: 'HP-SN-005678',
          status: 'available',
        }),
        createUnit({
          asset_tag: 'DESKTOP-001',
          device_type: 'desktop',
          brand: 'Lenovo',
          model: 'ThinkCentre M90',
          serial_number: 'LNV-SN-009012',
          status: 'available',
        }),
        createUnit({
          asset_tag: 'PHONE-001',
          device_type: 'phone',
          brand: 'Apple',
          model: 'iPhone 14 Pro',
          serial_number: 'APL-SN-003456',
          status: 'available',
        }),
        createUnit({
          asset_tag: 'MONITOR-001',
          device_type: 'monitor',
          brand: 'Dell',
          model: 'UltraSharp 27"',
          serial_number: 'DLL-MON-007890',
          status: 'available',
        }),
      ]);

      // Assign some units to users
      await assignUnit(units[0].id, users[0].id);
      await assignUnit(units[1].id, users[1].id);
      await assignUnit(units[3].id, users[2].id);

      toast.success('Sample data seeded successfully!');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error seeding data:', error);
      toast.error('Failed to seed sample data');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Sample Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Load sample IT assets and users to get started quickly
        </p>
        <Button onClick={seedSampleData} disabled={seeding} className="w-full">
          {seeding ? 'Loading...' : 'Load Sample Data'}
        </Button>
      </CardContent>
    </Card>
  );
}