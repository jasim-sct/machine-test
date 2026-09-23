import React from 'react';
import {
  PageHeader,
  ContentContainer,
  Card,
  CardHeader,
  CardContent,
  Badge,
} from '../../components';

export const UserDashboardPage: React.FC = () => {
  return (
    <ContentContainer>
      <PageHeader
        title="Dashboard"
        description="Welcome to your workspace"
      />

      <div style={{ maxWidth: '680px' }}>
        <Card>
          <CardHeader
            title="Upcoming Features"
            action={<Badge variant="info">In Development</Badge>}
          />
          <CardContent>
            <p style={{ color: 'var(--color-text-secondary)', margin: 0, lineHeight: 'var(--line-height-relaxed)' }}>
              More exciting features and integrations are currently under development. Stay tuned for platform updates!
            </p>
          </CardContent>
        </Card>
      </div>
    </ContentContainer>
  );
};
