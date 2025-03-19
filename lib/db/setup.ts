import { exec } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { promisify } from 'node:util';
import readline from 'node:readline';
import path from 'node:path';

const execAsync = promisify(exec);

function question(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

async function getPostgresURL(): Promise<string> {
  console.log('Step 1: Setting up Postgres');
  const dbChoice = await question(
    'Do you want to use a local Postgres instance with Docker (L) or a remote Postgres instance (R)? (L/R): '
  );

  if (dbChoice.toLowerCase() === 'l') {
    console.log('Setting up local Postgres instance with Docker...');
    await setupLocalPostgres();
    return 'postgres://postgres:postgres@localhost:54322/postgres';
  } else {
    console.log(
      'You can find Postgres databases at: https://vercel.com/marketplace?category=databases'
    );
    return await question('Enter your POSTGRES_URL: ');
  }
}

async function setupLocalPostgres() {
  console.log('Checking if Docker is installed...');
  try {
    await execAsync('docker --version');
    console.log('Docker is installed.');
  } catch (error) {
    console.error(
      'Docker is not installed. Please install Docker and try again.'
    );
    console.log(
      'To install Docker, visit: https://docs.docker.com/get-docker/'
    );
    process.exit(1);
  }

  console.log('Creating docker-compose.yml file...');
  const dockerComposeContent = `
services:
  postgres:
    image: postgres:16.4-alpine
    container_name: music_player_postgres
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "54322:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
  pgadmin:
    image: dpage/pgadmin4
    container_name: pgadmin4_container
    restart: always
    ports:
      - "80:80"
      - "443:443"
    environment:
      PGADMIN_CONFIG_SERVER_MODE: 'False'
      PGADMIN_DEFAULT_EMAIL: bugadev@proton.com
      PGADMIN_DEFAULT_PASSWORD: password
    volumes:
      - pgadmin_data:/var/lib/pgadmin

volumes:
  postgres_data:
  pgadmin_data:
`;

  await fs.writeFile(
    path.join(process.cwd(), 'docker-compose.yml'),
    dockerComposeContent
  );
  console.log('docker-compose.yml file created.');

  console.log('Starting Docker container with `docker compose up -d`...');
  try {
    await execAsync('docker compose up -d');
    console.log('Docker container started successfully.');
  } catch (error) {
    console.error(
      'Failed to start Docker container. Please check your Docker installation and try again.'
    );
    process.exit(1);
  }
}

async function writeEnvFile(envVars: Record<string, string>) {
  console.log('Step 3: Updating environment variables in .env');
  const envFilePath = path.join(process.cwd(), '.env');
  let envContent = '';

  // Try reading the existing .env file. If it doesn't exist, we'll create a new one.
  try {
    envContent = await fs.readFile(envFilePath, 'utf-8');
  } catch (error) {
    console.log('.env file does not exist. A new one will be created.');
  }

  // Split the content into lines (ignoring empty lines)
  const envLines = envContent.split('\n').filter(line => line.trim() !== '');

  // For each provided environment variable, update or append
  Object.entries(envVars).forEach(([key, value]) => {
    const regex = new RegExp(`^${key}=`);
    const lineIndex = envLines.findIndex(line => regex.test(line));
    if (lineIndex >= 0) {
      // Replace existing variable
      envLines[lineIndex] = `${key}=${value}`;
    } else {
      // Append new variable if not found
      envLines.push(`${key}=${value}`);
    }
  });

  // Join all lines and write back to the file
  const newEnvContent = envLines.join('\n');
  await fs.writeFile(envFilePath, newEnvContent);
  console.log('.env file updated with the necessary variables.');
}


async function main() {
  const POSTGRES_URL = await getPostgresURL();

  await writeEnvFile({
    POSTGRES_URL,
  });

  console.log('🎉 Setup completed successfully!');
}

main().catch(console.error);
