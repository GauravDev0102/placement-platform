import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const permissionsList = [
  'users:list', 'users:read', 'users:create', 'users:update', 'users:delete', 'users:manage',
  'companies:list', 'companies:read', 'companies:create', 'companies:update', 'companies:delete',
  'jobs:list', 'jobs:read', 'jobs:create', 'jobs:update', 'jobs:delete', 'jobs:publish',
  'applications:list', 'applications:read', 'applications:create', 'applications:update', 'applications:approve',
  'interviews:create', 'interviews:update', 'interviews:read',
  'drives:create', 'drives:update', 'drives:delete', 'drives:read',
  'analytics:view', 'analytics:export',
  'notifications:send', 'notifications:list',
  'audit:view', 'audit:export',
  'permissions:list', 'permissions:manage',
  'departments:manage',
  'reports:view', 'reports:export',
  'settings:manage',
  'tags:manage',
  'notes:create', 'notes:read',
  'saved-searches:manage',
  'email-templates:manage',
  'resumes:read', 'resumes:upload', 'resumes:delete',
];

const rolePermissions: Record<Role, string[]> = {
  ADMIN: permissionsList,
  OFFICER: [
    'users:list', 'users:read',
    'companies:list', 'companies:read', 'companies:create', 'companies:update',
    'jobs:list', 'jobs:read', 'jobs:create', 'jobs:update', 'jobs:publish',
  'applications:list', 'applications:read', 'applications:create', 'applications:update', 'applications:approve',
    'interviews:create', 'interviews:update', 'interviews:read',
    'drives:create', 'drives:update', 'drives:delete', 'drives:read',
    'analytics:view', 'analytics:export',
    'notifications:send', 'notifications:list',
    'audit:view',
    'reports:view', 'reports:export',
    'tags:manage',
    'notes:create', 'notes:read',
    'saved-searches:manage',
    'email-templates:manage',
    'resumes:read',
    'departments:manage',
  ],
  RECRUITER: [
    'users:list', 'users:read',
    'companies:list', 'companies:read', 'companies:create', 'companies:update',
    'jobs:list', 'jobs:read', 'jobs:create', 'jobs:update', 'jobs:delete', 'jobs:publish',
    'applications:list', 'applications:read', 'applications:update',
    'interviews:create', 'interviews:update', 'interviews:read',
    'notifications:send',
    'tags:manage',
    'notes:create', 'notes:read',
    'saved-searches:manage',
    'resumes:read',
    'analytics:view',
  ],
  STUDENT: [
    'users:read',
    'companies:list', 'companies:read',
    'jobs:list', 'jobs:read',
    'applications:list', 'applications:read', 'applications:create',
    'interviews:read',
    'resumes:read', 'resumes:upload',
    'notes:read',
    'notifications:list',
    'drives:read',
  ],
};

async function seed() {
  console.log('Seeding database...');

  for (const name of permissionsList) {
    await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('Permissions created');

  for (const [role, perms] of Object.entries(rolePermissions)) {
    for (const permName of perms) {
      const perm = await prisma.permission.findUnique({ where: { name: permName } });
      if (perm) {
        await prisma.rolePermission.upsert({
          where: { role_permissionId: { role: role as Role, permissionId: perm.id } },
          update: {},
          create: { role: role as Role, permissionId: perm.id },
        });
      }
    }
  }
  console.log('Role permissions assigned');

  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@placement.com' },
    update: {},
    create: {
      email: 'admin@placement.com',
      password: adminPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  });
  await prisma.profile.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id },
  });
  console.log('Admin user created');

  const officerPassword = await bcrypt.hash('officer123', 12);
  const officer = await prisma.user.upsert({
    where: { email: 'officer@placement.com' },
    update: {},
    create: {
      email: 'officer@placement.com',
      password: officerPassword,
      name: 'Placement Officer',
      role: 'OFFICER',
    },
  });
  await prisma.profile.upsert({
    where: { userId: officer.id },
    update: {},
    create: { userId: officer.id },
  });
  console.log('Officer user created');

  const studentPassword = await bcrypt.hash('student123', 12);
  const demoStudent = await prisma.user.upsert({
    where: { email: 'student@placement.com' },
    update: {
      name: 'Demo Student',
      role: 'STUDENT',
      isActive: true,
    },
    create: {
      email: 'student@placement.com',
      password: studentPassword,
      name: 'Demo Student',
      role: 'STUDENT',
    },
  });
  await prisma.profile.upsert({
    where: { userId: demoStudent.id },
    update: {},
    create: {
      userId: demoStudent.id,
      cgpa: 7.5,
      branch: 'CSE',
      graduationYear: 2027,
      backlogs: 0,
    },
  });
  console.log('Student user created');

  const recruiterPassword = await bcrypt.hash('recruiter123', 12);
  const demoRecruiter = await prisma.user.upsert({
    where: { email: 'recruiter@placement.com' },
    update: {
      name: 'Demo Recruiter',
      role: 'RECRUITER',
      isActive: true,
    },
    create: {
      email: 'recruiter@placement.com',
      password: recruiterPassword,
      name: 'Demo Recruiter',
      role: 'RECRUITER',
    },
  });
  await prisma.profile.upsert({
    where: { userId: demoRecruiter.id },
    update: {},
    create: { userId: demoRecruiter.id },
  });
  console.log('Recruiter user created');

  console.log('Seed completed!');
  console.log('---');
  console.log('Admin: admin@placement.com / admin123');
  console.log('Officer: officer@placement.com / officer123');
  console.log('Student: student@placement.com / student123 (pre-filled CGPA 7.5 CSE)');
  console.log('Recruiter: recruiter@placement.com / recruiter123 (create/join a company first)');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
