// Quick test to verify shutdown handling
const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Testing graceful shutdown...\n');

const testProcess = spawn('node', [path.join(__dirname, '..', 'dev-start.js')], {
  stdio: 'pipe'
});

let output = '';

testProcess.stdout.on('data', (data) => {
  output += data.toString();
  process.stdout.write(data);
});

testProcess.stderr.on('data', (data) => {
  output += data.toString();
  process.stderr.write(data);
});

// Wait 10 seconds then send SIGINT
setTimeout(() => {
  console.log('\n🛑 Sending SIGINT to test graceful shutdown...');
  testProcess.kill('SIGINT');
}, 10000);

testProcess.on('close', (code, signal) => {
  console.log(`\n✅ Process exited with code: ${code}, signal: ${signal}`);
  
  if (output.includes('Shutdown complete')) {
    console.log('🎉 Graceful shutdown test PASSED!');
  } else {
    console.log('❌ Graceful shutdown test FAILED!');
  }
  
  process.exit(0);
});

testProcess.on('error', (error) => {
  console.error('❌ Test process error:', error);
  process.exit(1);
});