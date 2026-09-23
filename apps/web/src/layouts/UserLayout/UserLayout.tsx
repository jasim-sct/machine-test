import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell, Sidebar, Header, ProfileTile, Badge } from '../../components';

export const UserLayout: React.FC = () => {
  return (
    <AppShell
      sidebar={<Sidebar />}
      header={
        <Header
          title={
            <Badge variant="neutral" pill>
              Member Portal
            </Badge>
          }
          actions={<ProfileTile />}
        />
      }
    >
      <Outlet />
    </AppShell>
  );
};
