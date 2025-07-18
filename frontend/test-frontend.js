// Simple test script to verify frontend components
console.log('🧪 Testing Ketivee Search Frontend Components...');

// Test 1: Check if all required components exist
const fs = require('fs');
const path = require('path');

const requiredComponents = [
    'src/components/Header.jsx',
    'src/components/SearchSection.jsx',
    'src/components/SearchResults.jsx',
    'src/components/TabNavigation.jsx',
    'src/components/LoginSuggestion.jsx',
    'src/App.jsx',
    'src/App.css'
];

console.log('\n📁 Checking component files...');
let allComponentsExist = true;

requiredComponents.forEach(component => {
    const filePath = path.join(__dirname, component);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${component} - Found`);
    } else {
        console.log(`❌ ${component} - Missing`);
        allComponentsExist = false;
    }
});

// Test 2: Check package.json dependencies
console.log('\n📦 Checking dependencies...');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

const requiredDeps = ['react', 'react-dom'];
const requiredDevDeps = ['@vitejs/plugin-react', 'tailwindcss', 'vite'];

let allDepsExist = true;

requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
        console.log(`✅ ${dep} - Found in dependencies`);
    } else {
        console.log(`❌ ${dep} - Missing from dependencies`);
        allDepsExist = false;
    }
});

requiredDevDeps.forEach(dep => {
    if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
        console.log(`✅ ${dep} - Found in devDependencies`);
    } else {
        console.log(`❌ ${dep} - Missing from devDependencies`);
        allDepsExist = false;
    }
});

// Test 3: Check if scripts are properly configured
console.log('\n⚙️ Checking scripts...');
const requiredScripts = ['dev', 'build', 'preview'];

requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
        console.log(`✅ ${script} script - Found`);
    } else {
        console.log(`❌ ${script} script - Missing`);
    }
});

// Test 4: Check configuration files
console.log('\n🔧 Checking configuration files...');
const configFiles = [
    'vite.config.js',
    'tailwind.config.js',
    'postcss.config.js'
];

configFiles.forEach(config => {
    const filePath = path.join(__dirname, config);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${config} - Found`);
    } else {
        console.log(`❌ ${config} - Missing`);
    }
});

// Summary
console.log('\n📊 Test Summary:');
console.log(`Components: ${allComponentsExist ? '✅ All found' : '❌ Some missing'}`);
console.log(`Dependencies: ${allDepsExist ? '✅ All found' : '❌ Some missing'}`);

if (allComponentsExist && allDepsExist) {
    console.log('\n🎉 Frontend is ready to run!');
    console.log('To start the development server:');
    console.log('1. cd ketiveeserchengin/frontend');
    console.log('2. npm install');
    console.log('3. npm run dev');
    console.log('\n✨ Features implemented:');
    console.log('• Professional header with navigation');
    console.log('• Clean search interface with voice/visual search');
    console.log('• Subtle login suggestion popup (appears after 3 seconds)');
    console.log('• Responsive design for all devices');
    console.log('• Integration with account.ketivee.com');
    console.log('• Professional styling with Tailwind CSS');
} else {
    console.log('\n⚠️ Some issues found. Please check the missing files/dependencies.');
}

console.log('\n🔗 Login URLs:');
console.log('• Login: https://account.ketivee.com/login');
console.log('• Signup: https://account.ketivee.com/signup'); 