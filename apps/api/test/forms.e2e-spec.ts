import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
const request = require('supertest');
import { AppModule } from '../src/app.module';

describe('Form Management & Public Form Flow (e2e)', () => {
  let app: INestApplication;
  let user1Token: string;
  let user2Token: string;
  let createdFormId: string;
  let publicId: string;
  let v1Id: string;
  let v2Id: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // Register User 1
    const email1 = `form.user1.${Date.now()}@example.com`;
    const res1 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Form Creator One',
        email: email1,
        password: 'UserPassword123!',
      })
      .expect(201);
    user1Token = res1.body.accessToken;

    // Register User 2
    const email2 = `form.user2.${Date.now()}@example.com`;
    const res2 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Form Creator Two',
        email: email2,
        password: 'UserPassword123!',
      })
      .expect(201);
    user2Token = res2.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. Form Creation & Initial Draft', () => {
    it('should create a form and automatically generate draft v1 and publicId', async () => {
      const res = await request(app.getHttpServer())
        .post('/forms')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ name: 'Customer Satisfaction Survey' })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.name).toBe('Customer Satisfaction Survey');
      expect(res.body.publicId).toBeDefined();
      expect(res.body.publicId.startsWith('f_')).toBe(true);
      expect(res.body.deployedVersionId).toBeNull();
      expect(res.body.versionsCount).toBe(1);
      expect(res.body.versions).toHaveLength(1);
      expect(res.body.versions[0].versionNumber).toBe(1);
      expect(res.body.versions[0].title).toBe('Customer Satisfaction Survey');
      expect(res.body.versions[0].isDeployed).toBe(false);

      createdFormId = res.body.id;
      publicId = res.body.publicId;
      v1Id = res.body.versions[0].id;
    });

    it('should list forms for authenticated user', async () => {
      const res = await request(app.getHttpServer())
        .get('/forms')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const found = res.body.find((f: any) => f.id === createdFormId);
      expect(found).toBeDefined();
      expect(found.publicId).toBe(publicId);
    });

    it('should get single form with all its versions', async () => {
      const res = await request(app.getHttpServer())
        .get(`/forms/${createdFormId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(res.body.id).toBe(createdFormId);
      expect(res.body.versions).toHaveLength(1);
      expect(res.body.versions[0].id).toBe(v1Id);
    });
  });

  describe('2. Draft Version Management & Editable Title', () => {
    it('should create a second draft version v2', async () => {
      const res = await request(app.getHttpServer())
        .post(`/forms/${createdFormId}/versions`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ title: 'Customer Feedback v2 (Spring)' })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.versionNumber).toBe(2);
      expect(res.body.title).toBe('Customer Feedback v2 (Spring)');
      expect(res.body.isDeployed).toBe(false);

      v2Id = res.body.id;
    });

    it('should edit draft version title', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/forms/${createdFormId}/versions/${v2Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ title: 'Customer Feedback v2 (Updated Summer)' })
        .expect(200);

      expect(res.body.id).toBe(v2Id);
      expect(res.body.title).toBe('Customer Feedback v2 (Updated Summer)');
    });

    it('should reject editing version without title', async () => {
      await request(app.getHttpServer())
        .patch(`/forms/${createdFormId}/versions/${v2Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ title: '' })
        .expect(400);
    });
  });

  describe('3. Version Deployment & Single Deployed Invariant', () => {
    it('should deploy version 1', async () => {
      const res = await request(app.getHttpServer())
        .post(`/forms/${createdFormId}/versions/${v1Id}/deploy`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(201);

      expect(res.body.deployedVersionId).toBe(v1Id);
      const v1 = res.body.versions.find((v: any) => v.id === v1Id);
      const v2 = res.body.versions.find((v: any) => v.id === v2Id);
      expect(v1.isDeployed).toBe(true);
      expect(v2.isDeployed).toBe(false);
    });

    it('should switch deployed version to version 2 (ensuring only one deployed)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/forms/${createdFormId}/versions/${v2Id}/deploy`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(201);

      expect(res.body.deployedVersionId).toBe(v2Id);
      const v1 = res.body.versions.find((v: any) => v.id === v1Id);
      const v2 = res.body.versions.find((v: any) => v.id === v2Id);
      expect(v1.isDeployed).toBe(false);
      expect(v2.isDeployed).toBe(true);
    });
  });

  describe('4. Public Form Access & Real-Time Reflection', () => {
    it('should access public form without authentication and see deployed title', async () => {
      const res = await request(app.getHttpServer())
        .get(`/public/forms/${publicId}`)
        .expect(200);

      expect(res.body.name).toBe('Customer Satisfaction Survey');
      expect(res.body.title).toBe('Customer Feedback v2 (Updated Summer)');
      expect(res.body.isDeployed).toBe(true);
      expect(res.body.publicId).toBe(publicId);
    });

    it('should immediately reflect newly deployed version title publicly', async () => {
      // Switch back to v1
      await request(app.getHttpServer())
        .post(`/forms/${createdFormId}/versions/${v1Id}/deploy`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(201);

      // Verify public URL immediately serves v1's title
      const res = await request(app.getHttpServer())
        .get(`/public/forms/${publicId}`)
        .expect(200);

      expect(res.body.title).toBe('Customer Satisfaction Survey');
      expect(res.body.isDeployed).toBe(true);
    });

    it('should return 404 for nonexistent public form', async () => {
      await request(app.getHttpServer())
        .get('/public/forms/nonexistent-public-slug')
        .expect(404);
    });
  });

  describe('5. Access Control & Authorization', () => {
    it('should forbid other user from accessing or deploying form', async () => {
      await request(app.getHttpServer())
        .get(`/forms/${createdFormId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(403);

      await request(app.getHttpServer())
        .post(`/forms/${createdFormId}/versions/${v1Id}/deploy`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(403);
    });

    it('should reject unauthenticated requests to protected endpoints', async () => {
      await request(app.getHttpServer())
        .get('/forms')
        .expect(401);

      await request(app.getHttpServer())
        .post('/forms')
        .send({ name: 'Hacker Form' })
        .expect(401);
    });
  });

  describe('6. Elements, Public Submissions & Unified Data View Preservation', () => {
    const elFullName = {
      id: 'fld_name',
      type: 'text',
      label: 'Full Name',
      placeholder: 'Enter your name',
      required: true,
      colSpan: 12,
    };

    const elEmail = {
      id: 'fld_email',
      type: 'email',
      label: 'Work Email',
      placeholder: 'you@company.com',
      required: true,
      colSpan: 6,
    };

    const elOldNotes = {
      id: 'fld_notes',
      type: 'textarea',
      label: 'Initial Notes',
      required: false,
      colSpan: 12,
    };

    it('should update draft v1 with elements and deploy it', async () => {
      const updateRes = await request(app.getHttpServer())
        .patch(`/forms/${createdFormId}/versions/${v1Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'Version 1 with Elements',
          elements: [elFullName, elEmail, elOldNotes],
        })
        .expect(200);

      expect(updateRes.body.elements).toHaveLength(3);
      expect(updateRes.body.elements[0].id).toBe('fld_name');

      // Deploy v1
      await request(app.getHttpServer())
        .post(`/forms/${createdFormId}/versions/${v1Id}/deploy`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(201);

      // Verify public form now returns the elements
      const pubRes = await request(app.getHttpServer())
        .get(`/public/forms/${publicId}`)
        .expect(200);

      expect(pubRes.body.elements).toHaveLength(3);
      expect(pubRes.body.elements[0].label).toBe('Full Name');
    });

    it('should reject submission if required element is missing', async () => {
      await request(app.getHttpServer())
        .post(`/public/forms/${publicId}/submissions`)
        .send({
          data: {
            fld_email: 'test@example.com',
          },
        })
        .expect(400);
    });

    it('should submit response for v1 deployed form', async () => {
      const subRes = await request(app.getHttpServer())
        .post(`/public/forms/${publicId}/submissions`)
        .send({
          data: {
            fld_name: 'Alice Johnson',
            fld_email: 'alice@example.com',
            fld_notes: 'Great onboarding experience!',
          },
        })
        .expect(201);

      expect(subRes.body.message).toBe('Submission received successfully');
      expect(subRes.body.id).toBeDefined();
    });

    it('should create v2 adding a new field (rating) and removing an old field (notes)', async () => {
      const elRating = {
        id: 'fld_rating',
        type: 'select',
        label: 'Satisfaction Score',
        options: ['1', '2', '3', '4', '5'],
        required: true,
        colSpan: 6,
      };

      // v2 has Full Name, Email, and Satisfaction Score (fld_notes was removed)
      await request(app.getHttpServer())
        .patch(`/forms/${createdFormId}/versions/${v2Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'Version 2 (With Rating, No Notes)',
          elements: [elFullName, elEmail, elRating],
        })
        .expect(200);

      // Deploy v2
      await request(app.getHttpServer())
        .post(`/forms/${createdFormId}/versions/${v2Id}/deploy`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(201);

      // Verify public form reflects new elements
      const pubRes = await request(app.getHttpServer())
        .get(`/public/forms/${publicId}`)
        .expect(200);

      expect(pubRes.body.elements).toHaveLength(3);
      expect(pubRes.body.elements.find((e: any) => e.id === 'fld_rating')).toBeDefined();
      expect(pubRes.body.elements.find((e: any) => e.id === 'fld_notes')).toBeUndefined();
    });

    it('should submit response for v2 deployed form', async () => {
      const subRes = await request(app.getHttpServer())
        .post(`/public/forms/${publicId}/submissions`)
        .send({
          data: {
            fld_name: 'Bob Smith',
            fld_email: 'bob@example.com',
            fld_rating: '5',
          },
        })
        .expect(201);

      expect(subRes.body.message).toBe('Submission received successfully');
    });

    it('should return complete unified Data View preserving all columns and historical rows', async () => {
      const dataRes = await request(app.getHttpServer())
        .get(`/forms/${createdFormId}/data`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(dataRes.body.formId).toBe(createdFormId);
      expect(dataRes.body.totalCount).toBe(2);
      expect(dataRes.body.rows).toHaveLength(2);

      // Verify columns union: fld_name, fld_email, fld_notes (from v1), fld_rating (from v2)
      const columnIds = dataRes.body.columns.map((c: any) => c.id);
      expect(columnIds).toContain('fld_name');
      expect(columnIds).toContain('fld_email');
      expect(columnIds).toContain('fld_notes');
      expect(columnIds).toContain('fld_rating');

      // The newest row is Bob (v2)
      const bobRow = dataRes.body.rows.find((r: any) => r.data.fld_name === 'Bob Smith');
      expect(bobRow).toBeDefined();
      expect(bobRow.data.fld_rating).toBe('5');
      // For fld_notes which did not exist when Bob submitted, it must be empty string
      expect(bobRow.data.fld_notes).toBe('');

      // The older row is Alice (v1)
      const aliceRow = dataRes.body.rows.find((r: any) => r.data.fld_name === 'Alice Johnson');
      expect(aliceRow).toBeDefined();
      expect(aliceRow.data.fld_notes).toBe('Great onboarding experience!');
      // For fld_rating which did not exist when Alice submitted, it must be empty string
      expect(aliceRow.data.fld_rating).toBe('');
    });
  });

  describe('7. Hierarchical Form Structure, Duplicate Reference Guard & Regex Validation', () => {
    let hierarchicalFormId: string;
    let hierarchicalPublicId: string;
    let hierarchicalV1Id: string;

    it('should create form with realistic default form structure (sections, zones, validation)', async () => {
      const res = await request(app.getHttpServer())
        .post('/forms')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ name: 'Realistic Contact & Feedback Form' })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.versions[0].sections).toBeDefined();
      expect(res.body.versions[0].sections.length).toBeGreaterThanOrEqual(2);
      expect(res.body.versions[0].sections[0].zones.length).toBeGreaterThanOrEqual(1);

      // Verify non-interactive title/description exist in default template
      const allElements = res.body.versions[0].elements;
      expect(allElements.some((el: any) => el.type === 'title')).toBe(true);
      expect(allElements.some((el: any) => el.type === 'description')).toBe(true);

      // Verify validation exists on default username field
      const usernameField = allElements.find((el: any) => el.reference === 'user_name');
      expect(usernameField).toBeDefined();
      expect(usernameField.validation?.enabled).toBe(true);
      expect(usernameField.validation?.pattern).toBeDefined();

      hierarchicalFormId = res.body.id;
      hierarchicalPublicId = res.body.publicId;
      hierarchicalV1Id = res.body.versions[0].id;
    });

    it('should block deployment if duplicate references exist in sections', async () => {
      // Update v1 with duplicate references
      const duplicateSections = [
        {
          id: 'sec_1',
          name: 'Section 1',
          layout: 'row',
          zones: [
            {
              id: 'zone_1',
              layout: 'column',
              responsiveWidth: { desktop: 'half', tablet: 'full', mobile: 'full' },
              elements: [
                {
                  id: 'el_1',
                  type: 'text',
                  name: 'User Handle',
                  reference: 'handle',
                  required: true,
                },
              ],
            },
            {
              id: 'zone_2',
              layout: 'column',
              responsiveWidth: { desktop: 'half', tablet: 'full', mobile: 'full' },
              elements: [
                {
                  id: 'el_2',
                  type: 'text',
                  name: 'Company Handle',
                  reference: 'handle', // DUPLICATE reference!
                  required: true,
                },
              ],
            },
          ],
        },
      ];

      await request(app.getHttpServer())
        .patch(`/forms/${hierarchicalFormId}/versions/${hierarchicalV1Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ sections: duplicateSections })
        .expect(200);

      // Attempting to deploy must be rejected with 400
      const deployRes = await request(app.getHttpServer())
        .post(`/forms/${hierarchicalFormId}/versions/${hierarchicalV1Id}/deploy`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(400);

      expect(deployRes.body.message).toContain('duplicate field reference');
    });

    it('should allow deployment once duplicate reference is resolved and enforce regex validation on submission', async () => {
      // Fix duplicate reference and configure regex validation
      const validSections = [
        {
          id: 'sec_1',
          name: 'Account Section',
          layout: 'row',
          zones: [
            {
              id: 'zone_1',
              layout: 'column',
              responsiveWidth: { desktop: 'full', tablet: 'full', mobile: 'full' },
              elements: [
                {
                  id: 'el_1',
                  type: 'text',
                  name: 'Username',
                  reference: 'username',
                  required: true,
                  validation: {
                    enabled: true,
                    pattern: '^[a-zA-Z0-9_]{3,10}$',
                    errorMessage: 'Username must be 3-10 alphanumeric characters',
                    successMessage: 'Username is valid',
                  },
                },
              ],
            },
          ],
        },
      ];

      await request(app.getHttpServer())
        .patch(`/forms/${hierarchicalFormId}/versions/${hierarchicalV1Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ sections: validSections })
        .expect(200);

      // Now deploy succeeds
      await request(app.getHttpServer())
        .post(`/forms/${hierarchicalFormId}/versions/${hierarchicalV1Id}/deploy`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(201);

      // Submit with invalid regex input (contains '@') -> must be rejected with 400
      const invalidSub = await request(app.getHttpServer())
        .post(`/public/forms/${hierarchicalPublicId}/submissions`)
        .send({
          data: {
            username: 'bad@user',
          },
        })
        .expect(400);

      expect(invalidSub.body.message).toBe('Username must be 3-10 alphanumeric characters');

      // Submit with valid input -> succeeds with 201
      const validSub = await request(app.getHttpServer())
        .post(`/public/forms/${hierarchicalPublicId}/submissions`)
        .send({
          data: {
            username: 'valid_user',
          },
        })
        .expect(201);

      expect(validSub.body.id).toBeDefined();
    });
  });
});

