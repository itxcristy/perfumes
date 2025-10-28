import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function deploy() {
  try {
    console.log('Starting deployment process...');
    
    // Clean previous builds
    console.log('Cleaning previous builds...');
    await execPromise('npm run clean');
    
    // Build the project
    console.log('Building the project...');
    const { stdout, stderr } = await execPromise('npm run build');
    
    if (stderr) {
      console.error('Build stderr:', stderr);
    }
    
    console.log('Build stdout:', stdout);
    console.log('Build completed successfully!');
    
    // Deploy to Netlify
    console.log('Deploying to Netlify...');
    const { stdout: deployStdout, stderr: deployStderr } = await execPromise('netlify deploy --prod --dir=dist');
    
    if (deployStderr) {
      console.error('Deploy stderr:', deployStderr);
    }
    
    console.log('Deploy stdout:', deployStdout);
    console.log('Deployment completed successfully!');
  } catch (error) {
    console.error('Deployment failed:', error.message);
    process.exit(1);
  }
}

deploy();