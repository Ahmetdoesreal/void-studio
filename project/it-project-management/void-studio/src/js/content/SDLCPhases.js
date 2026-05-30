/**
 * SDLCPhases.js — Phase definitions, tasks, and office blueprints
 * Maps each SDLC phase to unlockable office elements
 */

export const SDLC_PHASES = [
  {
    id: 'requirements',
    name: 'Requirements Gathering',
    description: 'Gather and document project requirements from stakeholders.',
    color: '#6c63ff',
    icon: '📋',
    tasks: [
      { id: 'req-1', text: 'Interview stakeholders', description: 'Meet with key stakeholders to understand their needs.' },
      { id: 'req-2', text: 'Document requirements', description: 'Write clear, testable requirements.' },
      { id: 'req-3', text: 'Prioritize features', description: 'Use MoSCoW to prioritize.' },
      { id: 'req-4', text: 'Get stakeholder sign-off', description: 'Present requirements and get approval.' }
    ],
    officeUnlocks: [
      { type: 'floor', name: 'Reception Platform', gridPos: { x: 0, z: 0 }, size: { w: 4, d: 4 } },
      { type: 'furniture', name: 'Reception Desk', gridPos: { x: 1, z: 1 }, model: 'desk_reception' },
      { type: 'furniture', name: 'Whiteboard', gridPos: { x: 3, z: 1 }, model: 'whiteboard' },
      { type: 'furniture', name: 'Welcome Plant', gridPos: { x: 0, z: 3 }, model: 'plant' }
    ],
    resourceReward: { budget: 5, morale: 10, techDebt: 0, time: 0 },
    difficulty: 1
  },
  {
    id: 'design',
    name: 'System Design',
    description: 'Design the system architecture and UI/UX.',
    color: '#a855f7',
    icon: '🎨',
    tasks: [
      { id: 'des-1', text: 'Create system architecture', description: 'Design the high-level architecture.' },
      { id: 'des-2', text: 'Design database schema', description: 'Model the data structures.' },
      { id: 'des-3', text: 'Create UI wireframes', description: 'Sketch the user interface.' },
      { id: 'des-4', text: 'Review design with team', description: 'Get team feedback on designs.' }
    ],
    officeUnlocks: [
      { type: 'floor', name: 'Architecture Wing', gridPos: { x: 4, z: 0 }, size: { w: 3, d: 4 } },
      { type: 'furniture', name: 'Meeting Table', gridPos: { x: 5, z: 1 }, model: 'table_meeting' },
      { type: 'furniture', name: 'Office Chairs (4)', gridPos: { x: 5, z: 2 }, model: 'chairs_set' },
      { type: 'furniture', name: 'Design Screen', gridPos: { x: 6, z: 0 }, model: 'screen_large' },
      { type: 'wall', name: 'Glass Partition', gridPos: { x: 4, z: 0 }, orientation: 'vertical', length: 4 }
    ],
    resourceReward: { budget: 0, morale: 5, techDebt: -5, time: 0 },
    difficulty: 2
  },
  {
    id: 'implementation',
    name: 'Implementation',
    description: 'Write the code. Build the product.',
    color: '#3b82f6',
    icon: '💻',
    tasks: [
      { id: 'imp-1', text: 'Set up development environment', description: 'Configure tools and CI/CD pipeline.' },
      { id: 'imp-2', text: 'Implement core features', description: 'Build the main functionality.' },
      { id: 'imp-3', text: 'Code review & refactor', description: 'Ensure code quality.' },
      { id: 'imp-4', text: 'Integration testing', description: 'Test components together.' },
      { id: 'imp-5', text: 'Sprint retrospective', description: 'Reflect on the sprint.' }
    ],
    officeUnlocks: [
      { type: 'floor', name: 'Developer Bullpen', gridPos: { x: 0, z: 4 }, size: { w: 5, d: 4 } },
      { type: 'furniture', name: 'Dev Desk 1', gridPos: { x: 0, z: 4 }, model: 'desk_dev' },
      { type: 'furniture', name: 'Dev Desk 2', gridPos: { x: 2, z: 4 }, model: 'desk_dev' },
      { type: 'furniture', name: 'Dev Desk 3', gridPos: { x: 0, z: 6 }, model: 'desk_dev' },
      { type: 'furniture', name: 'Dev Desk 4', gridPos: { x: 2, z: 6 }, model: 'desk_dev' },
      { type: 'furniture', name: 'Server Rack', gridPos: { x: 4, z: 5 }, model: 'server_rack' },
      { type: 'furniture', name: 'Coffee Machine', gridPos: { x: 4, z: 7 }, model: 'coffee_machine' }
    ],
    resourceReward: { budget: -10, morale: -5, techDebt: 15, time: -5 },
    difficulty: 3
  },
  {
    id: 'testing',
    name: 'Testing & QA',
    description: 'Test the product thoroughly. Hunt bugs.',
    color: '#22c55e',
    icon: '🔍',
    tasks: [
      { id: 'tst-1', text: 'Write test cases', description: 'Create comprehensive test suites.' },
      { id: 'tst-2', text: 'Run automated tests', description: 'Execute unit and integration tests.' },
      { id: 'tst-3', text: 'User acceptance testing', description: 'Get real users to test.' },
      { id: 'tst-4', text: 'Fix critical bugs', description: 'Address showstopper issues.' }
    ],
    officeUnlocks: [
      { type: 'floor', name: 'QA Lab', gridPos: { x: 5, z: 4 }, size: { w: 3, d: 4 } },
      { type: 'furniture', name: 'QA Workstation', gridPos: { x: 5, z: 4 }, model: 'desk_qa' },
      { type: 'furniture', name: 'Bug Tracking Board', gridPos: { x: 7, z: 4 }, model: 'board_bug' },
      { type: 'furniture', name: 'Test Device Shelf', gridPos: { x: 7, z: 6 }, model: 'shelf_devices' }
    ],
    resourceReward: { budget: -5, morale: 5, techDebt: -20, time: -3 },
    difficulty: 2
  },
  {
    id: 'deployment',
    name: 'Deployment',
    description: 'Ship it. Deploy to production.',
    color: '#f59e0b',
    icon: '🚀',
    tasks: [
      { id: 'dep-1', text: 'Prepare deployment plan', description: 'Plan the rollout strategy.' },
      { id: 'dep-2', text: 'Configure production', description: 'Set up servers and infrastructure.' },
      { id: 'dep-3', text: 'Deploy & monitor', description: 'Push to production and watch metrics.' },
      { id: 'dep-4', text: 'Post-deployment review', description: 'Verify everything is stable.' }
    ],
    officeUnlocks: [
      { type: 'floor', name: 'Operations Center', gridPos: { x: 0, z: 8 }, size: { w: 8, d: 3 } },
      { type: 'furniture', name: 'Monitoring Wall', gridPos: { x: 1, z: 8 }, model: 'monitor_wall' },
      { type: 'furniture', name: 'Ops Desk', gridPos: { x: 3, z: 9 }, model: 'desk_ops' },
      { type: 'furniture', name: 'Network Cabinet', gridPos: { x: 6, z: 8 }, model: 'network_cabinet' },
      { type: 'decor', name: 'Status Lights', gridPos: { x: 7, z: 8 }, model: 'status_lights' }
    ],
    resourceReward: { budget: -15, morale: 15, techDebt: 5, time: -5 },
    difficulty: 4
  },
  {
    id: 'maintenance',
    name: 'Maintenance & Support',
    description: 'Keep the lights on. The office comes alive.',
    color: '#00d4aa',
    icon: '🏢',
    tasks: [
      { id: 'mnt-1', text: 'Set up monitoring', description: 'Configure alerts and dashboards.' },
      { id: 'mnt-2', text: 'Handle first support tickets', description: 'Respond to user issues.' },
      { id: 'mnt-3', text: 'Plan iteration 2', description: 'Gather feedback for the next version.' },
      { id: 'mnt-4', text: 'Celebrate launch! 🎉', description: 'The team deserves it.' }
    ],
    officeUnlocks: [
      { type: 'floor', name: 'Lounge Area', gridPos: { x: 3, z: 11 }, size: { w: 5, d: 3 } },
      { type: 'furniture', name: 'Couch', gridPos: { x: 4, z: 11 }, model: 'couch' },
      { type: 'furniture', name: 'Coffee Table', gridPos: { x: 5, z: 12 }, model: 'table_coffee' },
      { type: 'decor', name: 'Indoor Plants', gridPos: { x: 3, z: 13 }, model: 'plants_cluster' },
      { type: 'decor', name: 'Company Logo Wall', gridPos: { x: 7, z: 11 }, model: 'logo_wall' },
      { type: 'decor', name: 'Trophy Case', gridPos: { x: 7, z: 13 }, model: 'trophy_case' },
      { type: 'ambient', name: 'Window View of the Void', gridPos: { x: 0, z: 11 }, model: 'window_void' }
    ],
    resourceReward: { budget: 10, morale: 20, techDebt: -10, time: 5 },
    difficulty: 1
  }
];

export const PHASE_NAMES = SDLC_PHASES.map(p => p.id);
export const TOTAL_PHASES = SDLC_PHASES.length;
