"use client";

import { useEffect, useState } from "react";

interface Device {
  id: number;
  name: string;
  isOn: boolean;
}

const DevicePage: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch("/api/data/device");
        const data = await response.json();
        setDevices(data.data.devices);
      } catch (error) {
        console.error("Error fetching devices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Devices</h1>
      <ul>
        {devices.map((device) => (
          <li key={device.id}>
            {device.name} - {device.isOn ? "On" : "Off"}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DevicePage;
