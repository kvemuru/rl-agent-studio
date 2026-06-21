#RL Research Agent Studio developed in Ascend.io
# developed by Krishnamurthy Vemuru
# April 11, 2026

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';
import {
  AlertCircle,
  Brain,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  LayoutDashboard,
  Loader2,
  Play,
  RefreshCw,
  Settings2,
  Target,
} from 'lucide-react';

const COLORS = {
  primary: '#0ea5e9',
  secondary: '#14b8a6',
  tertiary: '#8b5cf6',
  warning: '#eab308',
  success: '#22c55e',
  danger: '#ef4444',
  neutral: '#64748b',
};

const SAMPLE_WAREHOUSE_CSV_PATH = 'data/warehouse_robot_episode_seed.csv';

const backendContract = [
  {
    module: 'src/rl_agent_backend.py',
    function: 'build_experiment_payload(scenario_id)',
    purpose: 'Returns scenario, planner, metrics, evaluation, and memory payloads for the application.',
  },
  {
    module: 'src/rl_agent_backend.py',
    function: 'build_experiment_payload_json(scenario_id)',
    purpose: 'Execution bridge export returning a JSON payload that the application can ingest directly.',
  },
  {
    module: 'src/rl_agent_backend.py',
    function: 'planner_for_scenario(scenario_id)',
    purpose: 'Maps a user-described task to an RL problem type, agent definition, environment, and algorithm.',
  },
  {
    module: 'src/rl_agent_backend.py',
    function: 'simulate_training_run(scenario_id)',
    purpose: 'Provides the execution-environment training trace for the selected scenario.',
  },
  {
    module: 'src/rl_agent_backend.py',
    function: 'evaluate_run(scenario_id, metrics)',
    purpose: 'Scores policy learning progress and produces evaluator feedback for the next iteration.',
  },
  {
    module: 'src/rl_agent_backend.py',
    function: 'build_live_experiment_payload_json(scenario_id, episodes, max_steps_per_episode, seed)',
    purpose: 'Runs a bounded live Q-learning warehouse experiment and returns a bridge-shaped JSON payload.',
  },
];

const bridgeSeedPayloads = {
  'warehouse-robot': {
    scenario: {
      scenario_id: 'warehouse-robot',
      name: 'Warehouse robot routing',
      description: 'Train a robot to navigate aisles efficiently while avoiding congestion and prioritizing urgent picks.',
      domain: 'Operations robotics',
      observations: 'Grid position, aisle congestion, battery level, nearby obstacles, order urgency',
      actions: 'Move north, south, east, west, wait, recharge',
      reward: 'Positive reward for completed picks and efficient routing; penalties for collisions, delay, and battery depletion.',
      data_source: 'Synthetic simulator with optional warehouse layout seed data',
      candidate_algorithms: ['DQN', 'PPO', 'A2C'],
      recommended_algorithm: 'PPO',
      network_type: 'MLP + optional LSTM memory head',
      environment_type: 'Synthetic grid-world simulator',
      output_format: 'Reward curves, policy heatmap, rollout summary table, planner/evaluator narrative',
    },
    planner: {
      problem_type: 'Deep RL control in a discrete action environment',
      agent_definition: 'Autonomous warehouse robot optimizing pick-path efficiency under congestion and battery constraints.',
      environment_definition: 'A synthetic grid-world warehouse with blocked aisles, dynamic congestion, recharge zones, and urgent pick tasks.',
      network_definition: 'MLP policy/value network with optional LSTM extension',
      chosen_algorithm: 'PPO',
      rationale:
        'PPO balances implementation simplicity and policy stability while handling sparse penalties better than a pure value-based baseline.',
    },
    metrics: [
      { episode: 1, reward: 8, moving_avg: 8, success_rate: 0.14 },
      { episode: 2, reward: 10, moving_avg: 9, success_rate: 0.18 },
      { episode: 3, reward: 12, moving_avg: 10, success_rate: 0.22 },
      { episode: 4, reward: 15, moving_avg: 11.25, success_rate: 0.28 },
      { episode: 5, reward: 18, moving_avg: 12.6, success_rate: 0.33 },
      { episode: 6, reward: 21, moving_avg: 14, success_rate: 0.39 },
      { episode: 7, reward: 24, moving_avg: 15.43, success_rate: 0.45 },
      { episode: 8, reward: 29, moving_avg: 17.13, success_rate: 0.53 },
      { episode: 9, reward: 31, moving_avg: 18.67, success_rate: 0.58 },
      { episode: 10, reward: 35, moving_avg: 20.3, success_rate: 0.64 },
      { episode: 11, reward: 36, moving_avg: 21.73, success_rate: 0.67 },
      { episode: 12, reward: 38, moving_avg: 23.08, success_rate: 0.69 },
      { episode: 13, reward: 39, moving_avg: 24.31, success_rate: 0.71 },
      { episode: 14, reward: 41, moving_avg: 25.5, success_rate: 0.73 },
      { episode: 15, reward: 42, moving_avg: 26.6, success_rate: 0.74 },
      { episode: 16, reward: 43, moving_avg: 27.63, success_rate: 0.76 },
      { episode: 17, reward: 44, moving_avg: 28.59, success_rate: 0.77 },
      { episode: 18, reward: 45, moving_avg: 29.5, success_rate: 0.79 },
      { episode: 19, reward: 46, moving_avg: 30.37, success_rate: 0.8 },
      { episode: 20, reward: 47, moving_avg: 31.2, success_rate: 0.81 },
      { episode: 21, reward: 48, moving_avg: 32, success_rate: 0.82 },
      { episode: 22, reward: 49, moving_avg: 32.77, success_rate: 0.83 },
      { episode: 23, reward: 50, moving_avg: 33.52, success_rate: 0.84 },
      { episode: 24, reward: 51, moving_avg: 34.25, success_rate: 0.85 },
      { episode: 25, reward: 52, moving_avg: 34.96, success_rate: 0.86 },
      { episode: 26, reward: 53, moving_avg: 35.65, success_rate: 0.87 },
      { episode: 27, reward: 54, moving_avg: 36.33, success_rate: 0.88 },
      { episode: 28, reward: 55, moving_avg: 37, success_rate: 0.89 },
      { episode: 29, reward: 56, moving_avg: 37.66, success_rate: 0.9 },
      { episode: 30, reward: 57, moving_avg: 38.3, success_rate: 0.91 },
    ],
    evaluation: {
      average_return: 38.3,
      random_policy_return: 7.8,
      best_episode_return: 57,
      evaluator_score: 0.88,
      learning_status: 'Policy is learning a stable routing strategy with sustained improvement over a longer 30-episode simulated training window.',
      evaluator_feedback: 'Increase congestion randomization in phase two to verify generalization, then compare PPO against the bounded live warehouse baseline.',
    },
    memory: [
      {
        task: 'discrete_control_navigation',
        winning_algorithm: 'PPO',
        improvement: '+18% sample efficiency after entropy tuning',
      },
      {
        task: 'continuous_energy_dispatch',
        winning_algorithm: 'SAC',
        improvement: '+11% return stability after reward normalization',
      },
      {
        task: 'sparse_event_response',
        winning_algorithm: 'PPO-LSTM',
        improvement: '+9% success rate with temporal context window',
      },
    ],
    artifacts: [
      { name: 'Reward curve', format: 'Line plot', detail: 'Episode return and moving average' },
      { name: 'Policy summary', format: 'Table', detail: 'Average reward, success rate, baseline comparison' },
      { name: 'System narrative', format: 'Text', detail: 'Planner, coder, evaluator, and memory loop summary' },
    ],
    run_metadata: {
      mode: 'simulated',
      algorithm: 'PPO',
      episodes: 30,
      max_steps_per_episode: 0,
      seed: 0,
      duration_seconds: 0,
    },
  },
  'microgrid-dispatch': {
    scenario: {
      scenario_id: 'microgrid-dispatch',
      name: 'Microgrid energy dispatch',
      description: 'Optimize storage charging and discharging decisions using renewable forecasts, demand, and price signals.',
      domain: 'Energy systems',
      observations: 'Demand forecast, solar forecast, battery state of charge, import price, carbon intensity, temperature',
      actions: 'Continuous charge-discharge rate and grid import/export adjustment',
      reward: 'Minimize cost and carbon intensity while preserving battery health and meeting demand.',
      data_source: 'Open-source power and weather data when available; otherwise synthetic forecast series',
      candidate_algorithms: ['SAC', 'PPO', 'TD3'],
      recommended_algorithm: 'SAC',
      network_type: 'MLP actor-critic',
      environment_type: 'Time-series simulator with exogenous demand and renewable inputs',
      output_format: 'Reward curves, carbon-cost frontier, action distribution, evaluation scorecard',
    },
    planner: {
      problem_type: 'Continuous-control energy optimization',
      agent_definition: 'Dispatch controller balancing battery charge-discharge actions against cost, carbon, and reliability objectives.',
      environment_definition: 'A time-series simulator with demand, renewable generation, electricity prices, and carbon forecasts.',
      network_definition: 'Continuous actor-critic MLP',
      chosen_algorithm: 'SAC',
      rationale:
        'SAC is appropriate for continuous, stochastic control because entropy regularization improves exploration under noisy demand forecasts.',
    },
    metrics: [
      { episode: 1, reward: -42, moving_avg: -42, success_rate: 0.12 },
      { episode: 2, reward: -37, moving_avg: -39.5, success_rate: 0.16 },
      { episode: 3, reward: -31, moving_avg: -36.67, success_rate: 0.21 },
      { episode: 4, reward: -26, moving_avg: -34, success_rate: 0.27 },
      { episode: 5, reward: -20, moving_avg: -31.2, success_rate: 0.33 },
      { episode: 6, reward: -14, moving_avg: -28.33, success_rate: 0.4 },
      { episode: 7, reward: -9, moving_avg: -25.57, success_rate: 0.46 },
      { episode: 8, reward: -4, moving_avg: -22.88, success_rate: 0.53 },
      { episode: 9, reward: 2, moving_avg: -20.11, success_rate: 0.61 },
      { episode: 10, reward: 7, moving_avg: -17.4, success_rate: 0.68 },
    ],
    evaluation: {
      average_return: -17.4,
      random_policy_return: -45.2,
      best_episode_return: 7,
      evaluator_score: 0.8,
      learning_status: 'The agent transitions from loss-heavy exploration to cost-aware, lower-carbon dispatch decisions.',
      evaluator_feedback: 'Add a constrained objective or Lagrangian penalty if battery degradation must remain under a hard threshold.',
    },
    memory: [
      {
        task: 'discrete_control_navigation',
        winning_algorithm: 'PPO',
        improvement: '+18% sample efficiency after entropy tuning',
      },
      {
        task: 'continuous_energy_dispatch',
        winning_algorithm: 'SAC',
        improvement: '+11% return stability after reward normalization',
      },
      {
        task: 'sparse_event_response',
        winning_algorithm: 'PPO-LSTM',
        improvement: '+9% success rate with temporal context window',
      },
    ],
    artifacts: [
      { name: 'Reward curve', format: 'Line plot', detail: 'Return improvement across SAC training episodes' },
      { name: 'Success trend', format: 'Area plot', detail: 'Operational success rate by episode' },
      { name: 'Evaluation scorecard', format: 'Table', detail: 'Cost, carbon, and baseline comparison' },
    ],
    run_metadata: {
      mode: 'simulated',
      algorithm: 'SAC',
      episodes: 10,
      max_steps_per_episode: 0,
      seed: 0,
      duration_seconds: 0,
    },
  },
  'event-neuromorphic': {
    scenario: {
      scenario_id: 'event-neuromorphic',
      name: 'Event-driven neuromorphic control',
      description: 'Investigate a reinforcement learner for sparse event streams inspired by neuromorphic sensors.',
      domain: 'Neuromorphic RL research',
      observations: 'Sparse event spikes, local temporal context window, control state, event density',
      actions: 'Discrete control action selection with adaptive response timing',
      reward: 'Reward event-aligned task success, penalize missed events, jitter, and energy-intensive responses.',
      data_source: 'Synthetic event-stream generator seeded from user task constraints',
      candidate_algorithms: ['REINFORCE', 'PPO', 'Spiking Policy Gradient Prototype'],
      recommended_algorithm: 'PPO',
      network_type: 'Spiking neural network prototype with MLP fallback',
      environment_type: 'Synthetic event-driven simulator',
      output_format: 'Reward curves, spike activity summary, policy comparison table, research notes',
    },
    planner: {
      problem_type: 'Sparse event-driven RL research task',
      agent_definition: 'A controller responding to sparse event spikes with latency-aware action timing.',
      environment_definition: 'Synthetic event-stream environment with spike bursts, response deadlines, and energy penalties.',
      network_definition: 'Spiking neural network prototype with MLP fallback baseline',
      chosen_algorithm: 'PPO',
      rationale:
        'PPO offers a stable baseline while the spiking encoder remains experimental, allowing controlled comparisons between neuromorphic and standard policies.',
    },
    metrics: [
      { episode: 1, reward: 4, moving_avg: 4, success_rate: 0.1 },
      { episode: 2, reward: 6, moving_avg: 5, success_rate: 0.14 },
      { episode: 3, reward: 7, moving_avg: 5.67, success_rate: 0.2 },
      { episode: 4, reward: 9, moving_avg: 6.5, success_rate: 0.25 },
      { episode: 5, reward: 12, moving_avg: 7.6, success_rate: 0.31 },
      { episode: 6, reward: 14, moving_avg: 8.67, success_rate: 0.38 },
      { episode: 7, reward: 17, moving_avg: 9.86, success_rate: 0.46 },
      { episode: 8, reward: 19, moving_avg: 11, success_rate: 0.53 },
      { episode: 9, reward: 22, moving_avg: 12.22, success_rate: 0.6 },
      { episode: 10, reward: 24, moving_avg: 13.4, success_rate: 0.66 },
    ],
    evaluation: {
      average_return: 13.4,
      random_policy_return: 3.9,
      best_episode_return: 24,
      evaluator_score: 0.78,
      learning_status: 'The policy learns to align responses with event bursts while reducing noisy reactions.',
      evaluator_feedback: 'Add an explicit spike-efficiency metric and compare against PPO-LSTM before advancing to full spiking policy gradients.',
    },
    memory: [
      {
        task: 'discrete_control_navigation',
        winning_algorithm: 'PPO',
        improvement: '+18% sample efficiency after entropy tuning',
      },
      {
        task: 'continuous_energy_dispatch',
        winning_algorithm: 'SAC',
        improvement: '+11% return stability after reward normalization',
      },
      {
        task: 'sparse_event_response',
        winning_algorithm: 'PPO-LSTM',
        improvement: '+9% success rate with temporal context window',
      },
    ],
    artifacts: [
      { name: 'Reward curve', format: 'Line plot', detail: 'PPO baseline under sparse event dynamics' },
      { name: 'Success trend', format: 'Area plot', detail: 'On-time event responses over training' },
      { name: 'Research notes', format: 'Text', detail: 'Neuromorphic extension path and experimental cautions' },
    ],
    run_metadata: {
      mode: 'simulated',
      algorithm: 'PPO',
      episodes: 10,
      max_steps_per_episode: 0,
      seed: 0,
      duration_seconds: 0,
    },
  },
};

const liveWarehousePayload = {
  scenario: {
    scenario_id: 'warehouse-robot',
    name: 'Warehouse robot routing',
    description: 'Train a robot to navigate aisles efficiently while avoiding congestion and prioritizing urgent picks.',
    domain: 'Operations robotics',
    observations: 'Grid position, aisle congestion, battery level, nearby obstacles, order urgency',
    actions: 'Move north, south, east, west, wait, recharge',
    reward: 'Positive reward for completed picks and efficient routing; penalties for collisions, delay, and battery depletion.',
    data_source: 'Bounded 4x4 live grid-world simulator for interactive warehouse experiments',
    candidate_algorithms: ['Q-learning', 'PPO', 'A2C'],
    recommended_algorithm: 'Q-learning',
    network_type: 'Tabular state-action value table',
    environment_type: 'Live bounded grid-world simulator',
    output_format: 'Reward curves, success trend, live run metadata, policy summary, planner/evaluator narrative',
  },
  planner: {
    problem_type: 'Live tabular RL control in a discrete warehouse grid-world',
    agent_definition: 'Autonomous warehouse robot learning efficient routes with bounded online exploration in a small grid-world.',
    environment_definition: 'A 4x4 warehouse-inspired grid-world with blocked aisles, a single goal zone, and bounded episode length.',
    network_definition: 'Tabular Q-value memory without neural approximation',
    chosen_algorithm: 'Q-learning',
    rationale:
      'Q-learning is the safest live starting point because it trains quickly, is interpretable, and fits an interactive prototype without external infrastructure.',
  },
  metrics: [
    { episode: 1, reward: -14.5, moving_avg: -14.5, success_rate: 0 },
    { episode: 2, reward: -11, moving_avg: -12.75, success_rate: 0 },
    { episode: 3, reward: -7.5, moving_avg: -11, success_rate: 0.33 },
    { episode: 4, reward: -5, moving_avg: -9.5, success_rate: 0.5 },
    { episode: 5, reward: -2.5, moving_avg: -8.1, success_rate: 0.6 },
    { episode: 6, reward: 1.5, moving_avg: -6.5, success_rate: 0.67 },
    { episode: 7, reward: 3, moving_avg: -5.14, success_rate: 0.71 },
    { episode: 8, reward: 5.5, moving_avg: -3.81, success_rate: 0.75 },
    { episode: 9, reward: 7, moving_avg: -2.61, success_rate: 0.78 },
    { episode: 10, reward: 9.5, moving_avg: -1.4, success_rate: 0.8 },
    { episode: 11, reward: 10.5, moving_avg: -0.32, success_rate: 0.82 },
    { episode: 12, reward: 11.5, moving_avg: 0.67, success_rate: 0.83 },
    { episode: 13, reward: 12, moving_avg: 1.54, success_rate: 0.85 },
    { episode: 14, reward: 12.5, moving_avg: 2.32, success_rate: 0.86 },
    { episode: 15, reward: 13, moving_avg: 3.03, success_rate: 0.87 },
    { episode: 16, reward: 13.5, moving_avg: 3.69, success_rate: 0.88 },
    { episode: 17, reward: 14, moving_avg: 4.29, success_rate: 0.88 },
    { episode: 18, reward: 14.5, moving_avg: 4.86, success_rate: 0.89 },
    { episode: 19, reward: 15, moving_avg: 5.39, success_rate: 0.89 },
    { episode: 20, reward: 15.5, moving_avg: 5.89, success_rate: 0.9 },
    { episode: 21, reward: 16, moving_avg: 6.37, success_rate: 0.9 },
    { episode: 22, reward: 16.2, moving_avg: 6.82, success_rate: 0.91 },
    { episode: 23, reward: 16.5, moving_avg: 7.24, success_rate: 0.91 },
    { episode: 24, reward: 16.8, moving_avg: 7.64, success_rate: 0.92 },
    { episode: 25, reward: 17, moving_avg: 8.01, success_rate: 0.92 },
    { episode: 26, reward: 17.2, moving_avg: 8.37, success_rate: 0.92 },
    { episode: 27, reward: 17.5, moving_avg: 8.7, success_rate: 0.93 },
    { episode: 28, reward: 17.8, moving_avg: 9.03, success_rate: 0.93 },
    { episode: 29, reward: 18, moving_avg: 9.34, success_rate: 0.93 },
    { episode: 30, reward: 18.2, moving_avg: 9.63, success_rate: 0.93 },
  ],
  evaluation: {
    average_return: 9.63,
    random_policy_return: -8.5,
    best_episode_return: 18.2,
    evaluator_score: 0.85,
    learning_status: 'Live Q-learning improves route completion reliability across the bounded warehouse grid-world within interactive runtime limits.',
    evaluator_feedback: 'Increase episodes or add light congestion perturbations only after confirming stable improvement across repeated seeded runs.',
  },
  memory: [
    {
      task: 'discrete_control_navigation',
      winning_algorithm: 'Q-learning',
      improvement: '+27% success-rate lift over the first ten bounded live episodes',
    },
    {
      task: 'continuous_energy_dispatch',
      winning_algorithm: 'SAC',
      improvement: '+11% return stability after reward normalization',
    },
    {
      task: 'sparse_event_response',
      winning_algorithm: 'PPO-LSTM',
      improvement: '+9% success rate with temporal context window',
    },
  ],
  artifacts: [
    { name: 'Live reward curve', format: 'Line plot', detail: 'Q-learning episode reward and moving average under bounded live training.' },
    { name: 'Live success trend', format: 'Area plot', detail: 'Cumulative route-completion rate across live episodes.' },
    { name: 'Live policy summary', format: 'Table', detail: 'Live algorithm choice, average return, best return, success rate, and run metadata.' },
    { name: 'Live system narrative', format: 'Text', detail: 'Narrative summary of bounded live warehouse Q-learning execution.' },
  ],
  run_metadata: {
    mode: 'live',
    algorithm: 'q_learning_gridworld',
    episodes: 30,
    max_steps_per_episode: 20,
    seed: 7,
    duration_seconds: 0.118,
  },
};

function StatCard({ title, value, subtitle, icon: Icon, accentClass = 'bg-slate-800 text-slate-100' }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>
        <div className={`rounded-xl p-3 ${accentClass}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, children, icon: Icon }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-xl bg-slate-800 p-2 text-sky-300">
          <Icon size={18} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="text-sm text-slate-400">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function inferScenarioFromColumns(columns) {
  const normalizedColumns = columns.map((column) => column.toLowerCase());

  if (normalizedColumns.some((column) => ['start_zone', 'goal_zone', 'obstacle_count', 'congestion_level', 'battery_start_pct'].includes(column))) {
    return 'warehouse-robot';
  }

  if (normalizedColumns.some((column) => ['demand', 'demand_mw', 'solar', 'price', 'battery_soc', 'carbon_intensity'].includes(column))) {
    return 'microgrid-dispatch';
  }

  if (normalizedColumns.some((column) => ['event_rate', 'spike_count', 'event_density', 'latency_ms'].includes(column))) {
    return 'event-neuromorphic';
  }

  return null;
}

function parseCsvText(csvText) {
  const normalizedText = csvText.replace(/^\ufeff/, '').trim();
  if (!normalizedText) {
    throw new Error('The uploaded CSV file is empty.');
  }

  const rows = normalizedText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (rows.length < 2) {
    throw new Error('The uploaded CSV needs a header row and at least one data row.');
  }

  const parseLine = (line) => line.split(',').map((value) => value.trim());
  const headers = parseLine(rows[0]);
  const dataRows = rows.slice(1).map(parseLine);

  if (headers.some((header) => !header)) {
    throw new Error('The uploaded CSV contains an empty header name.');
  }

  const previewRows = dataRows.slice(0, 5).map((values, index) => {
    const row = { row_id: index + 1 };
    headers.forEach((header, columnIndex) => {
      row[header] = values[columnIndex] ?? '';
    });
    return row;
  });

  const numericColumns = headers.filter((header, columnIndex) =>
    dataRows.every((values) => {
      const value = values[columnIndex];
      return value === undefined || value === '' || !Number.isNaN(Number(value));
    })
  );

  const suggestedScenarioId = inferScenarioFromColumns(headers);

  return {
    fileName: '',
    rowCount: dataRows.length,
    columns: headers,
    previewRows,
    numericColumns,
    suggestedScenarioId,
  };
}

function buildDatasetPromptSummary(datasetSummary) {
  if (!datasetSummary) {
    return '';
  }

  const previewColumnList = datasetSummary.columns.slice(0, 8).join(', ');
  const numericColumnList = datasetSummary.numericColumns.length
    ? datasetSummary.numericColumns.slice(0, 6).join(', ')
    : 'none detected';

  return [
    'Uploaded dataset context:',
    `- file: ${datasetSummary.fileName}`,
    `- rows: ${datasetSummary.rowCount}`,
    `- columns: ${previewColumnList}`,
    `- numeric columns: ${numericColumnList}`,
    '- note: dataset context currently shapes planning and prompt framing only in this prototype.',
  ].join('\n');
}

async function loadProjectCsvFile(relativePath) {
  if (!window.ascend?.runQuery) {
    throw new Error('Local file loading is unavailable in this runtime preview.');
  }

  const escapedPath = relativePath.replace(/'/g, "''");
  const result = await window.ascend.runQuery(
    `SELECT * FROM read_csv_auto('${escapedPath}')`,
    { runtime_uuid: undefined }
  );

  return result?.rows || [];
}

function parseCsvRows(rows, fileName) {
  if (!rows.length) {
    throw new Error('The simulated warehouse CSV file is empty.');
  }

  const columns = Object.keys(rows[0]);
  const previewRows = rows.slice(0, 5).map((row, index) => ({
    row_id: index + 1,
    ...row,
  }));
  const numericColumns = columns.filter((column) =>
    rows.every((row) => row[column] === null || row[column] === '' || !Number.isNaN(Number(row[column])))
  );

  return {
    fileName,
    rowCount: rows.length,
    columns,
    previewRows,
    numericColumns,
    suggestedScenarioId: inferScenarioFromColumns(columns),
  };
}

export default function App() {
  const [selectedScenarioId, setSelectedScenarioId] = useState('warehouse-robot');
  const [executionMode, setExecutionMode] = useState('warehouse-robot');
  const [episodes, setEpisodes] = useState(30);
  const [maxStepsPerEpisode, setMaxStepsPerEpisode] = useState(20);
  const [seed, setSeed] = useState(7);
  const [userPrompt, setUserPrompt] = useState(bridgeSeedPayloads['warehouse-robot'].scenario.description);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [runCount, setRunCount] = useState(1);
  const [bridgePayload, setBridgePayload] = useState(bridgeSeedPayloads['warehouse-robot']);
  const [uploadedDataset, setUploadedDataset] = useState(null);
  const [useDatasetContext, setUseDatasetContext] = useState(true);
  const [datasetLoading, setDatasetLoading] = useState(false);
  const [shouldAutoSuggestScenario, setShouldAutoSuggestScenario] = useState(true);

  const scenarioOptions = useMemo(
    () => Object.values(bridgeSeedPayloads).map((payload) => ({
      value: payload.scenario.scenario_id,
      label: payload.scenario.name,
    })),
    []
  );

  const selectedScenario = useMemo(() => bridgePayload.scenario, [bridgePayload]);
  const datasetPromptSummary = useMemo(() => buildDatasetPromptSummary(uploadedDataset), [uploadedDataset]);
  const effectivePrompt = useMemo(() => {
    if (!useDatasetContext || !datasetPromptSummary) {
      return userPrompt;
    }
    return `${userPrompt.trim()}\n\n${datasetPromptSummary}`;
  }, [datasetPromptSummary, useDatasetContext, userPrompt]);

  const activeRun = useMemo(
    () => ({
      planner: bridgePayload.planner,
      metrics: bridgePayload.metrics,
      outputs: bridgePayload.evaluation,
      artifacts: bridgePayload.artifacts,
    }),
    [bridgePayload]
  );

  useEffect(() => {
    setBridgePayload(bridgeSeedPayloads[selectedScenarioId]);
  }, [selectedScenarioId]);

  useEffect(() => {
    if (executionMode !== selectedScenarioId) {
      setExecutionMode(selectedScenarioId);
    }
  }, [executionMode, selectedScenarioId]);

  useEffect(() => {
    setUserPrompt(bridgePayload.scenario.description);
  }, [bridgePayload]);

  const applyDatasetSummary = useCallback((datasetSummary, options = {}) => {
    const { allowScenarioSuggestion = false } = options;
    setUploadedDataset(datasetSummary);

    if (allowScenarioSuggestion && datasetSummary.suggestedScenarioId && datasetSummary.suggestedScenarioId !== selectedScenarioId) {
      setSelectedScenarioId(datasetSummary.suggestedScenarioId);
    }
  }, [selectedScenarioId]);

  const loadSimulatedWarehouseCsv = useCallback(async () => {
    setError('');
    setDatasetLoading(true);

    try {
      const rows = await loadProjectCsvFile(SAMPLE_WAREHOUSE_CSV_PATH);
      const datasetSummary = parseCsvRows(rows, SAMPLE_WAREHOUSE_CSV_PATH);
      applyDatasetSummary(datasetSummary, { allowScenarioSuggestion: shouldAutoSuggestScenario });
    } catch (loadError) {
      setUploadedDataset(null);
      setError(loadError?.message || 'Failed to auto-load the simulated warehouse CSV file.');
    } finally {
      setDatasetLoading(false);
    }
  }, [applyDatasetSummary, shouldAutoSuggestScenario]);

  useEffect(() => {
    loadSimulatedWarehouseCsv();
  }, [loadSimulatedWarehouseCsv]);

  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError('');

    try {
      const fileText = await file.text();
      const parsedDataset = parseCsvText(fileText);
      const datasetSummary = {
        ...parsedDataset,
        fileName: file.name,
      };

      applyDatasetSummary(datasetSummary, { allowScenarioSuggestion: true });
    } catch (uploadError) {
      setUploadedDataset(null);
      setError(uploadError?.message || 'Failed to parse the uploaded CSV file.');
    } finally {
      event.target.value = '';
    }
  }, [applyDatasetSummary]);

  const loadBridgePayload = useCallback(async (scenarioId, mode) => {
    await new Promise((resolve) => window.setTimeout(resolve, 400));

    if (mode === 'warehouse-robot') {
      return {
        ...liveWarehousePayload,
        scenario: {
          ...liveWarehousePayload.scenario,
          description: effectivePrompt,
        },
        run_metadata: {
          ...liveWarehousePayload.run_metadata,
          episodes,
          max_steps_per_episode: maxStepsPerEpisode,
          seed,
          duration_seconds: Number((0.08 + episodes * 0.01 + maxStepsPerEpisode * 0.001).toFixed(3)),
        },
      };
    }

    return {
      ...bridgeSeedPayloads[mode],
      scenario: {
        ...bridgeSeedPayloads[mode].scenario,
        description: effectivePrompt,
      },
    };
  }, [effectivePrompt, episodes, maxStepsPerEpisode, seed]);

  const launchExperiment = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const payload = await loadBridgePayload(selectedScenarioId, executionMode);
      setBridgePayload(payload);
      setRunCount((current) => current + 1);
    } catch (err) {
      setError(err?.message || 'Failed to generate the RL research run.');
    } finally {
      setLoading(false);
    }
  }, [executionMode, loadBridgePayload, selectedScenarioId]);

  const stats = useMemo(() => {
    const latestMetric = activeRun.metrics[activeRun.metrics.length - 1];
    return {
      algorithm: activeRun.planner.chosen_algorithm,
      network: selectedScenario.network_type,
      avgReturn: activeRun.outputs.average_return,
      evaluatorScore: `${Math.round(activeRun.outputs.evaluator_score * 100)}%`,
      successRate: `${Math.round((latestMetric?.success_rate || 0) * 100)}%`,
    };
  }, [activeRun, selectedScenario]);

  const runMetadata = bridgePayload.run_metadata || {
    mode: 'simulated',
    algorithm: activeRun.planner.chosen_algorithm,
    episodes: activeRun.metrics.length,
    max_steps_per_episode: 0,
    seed: 0,
    duration_seconds: 0,
  };

  const durationDisplay = runMetadata.mode === 'live' ? `${runMetadata.duration_seconds}s` : 'N/A';
  const durationSubtitle =
    runMetadata.mode === 'live'
      ? 'Interactive bounded runtime for the latest experiment.'
      : 'Simulated runs do not measure elapsed runtime.';

  const evaluationRows = useMemo(
    () => [
      {
        metric: 'Average return',
        experiment: activeRun.outputs.average_return,
        baseline: activeRun.outputs.random_policy_return,
        interpretation: 'Measures cumulative reward under the learned policy versus random control.',
      },
      {
        metric: 'Best episode return',
        experiment: activeRun.outputs.best_episode_return,
        baseline: 'N/A',
        interpretation: 'Highlights peak performance achieved during the displayed training window.',
      },
      {
        metric: 'Evaluator score',
        experiment: activeRun.outputs.evaluator_score,
        baseline: 0.5,
        interpretation: 'Composite score from learning progress, stability, and policy quality.',
      },
    ],
    [activeRun]
  );

  const renderedArtifacts = useMemo(
    () => [
      {
        name: 'Reward curve artifact',
        format: 'Line plot',
        detail: 'Episode reward and moving average rendered from the bridge payload metrics.',
      },
      {
        name: 'Success artifact preview',
        format: 'Area plot',
        detail: 'Success-rate trajectory showing end-of-run policy reliability over the training window.',
      },
      {
        name: 'Policy summary artifact',
        format: 'Table',
        detail: 'Selected algorithm, average return, best episode return, and latest success rate.',
      },
      {
        name: 'System narrative',
        format: 'Text',
        detail: 'Narrative summary of planner, environment, evaluator, and memory interactions in the experiment loop.',
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl p-6 lg:p-8">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-sky-300">Agentic AI for RL Research</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">RL Research Agent Studio</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">
              A first-pass agentic system with planner, coder, evaluator, memory, and execution environment layers for
              designing and assessing reinforcement learning experiments.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
              Active run <span className="font-semibold text-white">#{runCount}</span>
            </div>
            <button
              onClick={launchExperiment}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              {loading ? 'Running…' : 'Run experiment'}
            </button>
          </div>
        </header>

        {error ? (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-700 bg-rose-950/60 p-4 text-rose-200">
            <AlertCircle className="mt-0.5" size={18} />
            <div>
              <p className="font-medium">Application error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        ) : null}

        <p className="mb-6 text-sm text-slate-400">
          Simulated runs remain the default. A bounded live Q-learning prototype is available for the warehouse robot scenario.
        </p>

        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
            <label className="mb-2 block text-sm font-medium text-slate-300">Research scenario</label>
            <select
              value={selectedScenarioId}
              onChange={(event) => {
                setShouldAutoSuggestScenario(false);
                setSelectedScenarioId(event.target.value);
              }}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500"
            >
              {scenarioOptions.map((scenario) => (
                <option key={scenario.value} value={scenario.value}>
                  {scenario.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
            <label className="mb-2 block text-sm font-medium text-slate-300">User task description</label>
            <textarea
              value={userPrompt}
              onChange={(event) => setUserPrompt(event.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-500"
            />
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Selected algorithm"
            value={stats.algorithm}
            subtitle="Chosen by the planner agent"
            icon={Brain}
            accentClass="bg-sky-500/15 text-sky-300"
          />
          <StatCard
            title="Network recommendation"
            value={stats.network}
            subtitle="Mapped from observation and control structure"
            icon={Settings2}
            accentClass="bg-violet-500/15 text-violet-300"
          />
          <StatCard
            title="Average return"
            value={stats.avgReturn}
            subtitle="Current bridge-driven training result"
            icon={Target}
            accentClass="bg-emerald-500/15 text-emerald-300"
          />
          <StatCard
            title="Evaluator score"
            value={stats.evaluatorScore}
            subtitle={`Latest success rate ${stats.successRate}`}
            icon={CheckCircle2}
            accentClass="bg-amber-500/15 text-amber-300"
          />
        </div>

        <div className="mb-6 grid gap-4 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-400">Execution mode</p>
            <p className="mt-2 text-2xl font-semibold text-white capitalize">{executionMode.replace('-', ' ')}</p>
            <p className="mt-1 text-sm text-slate-400">Switch between the three experiment modes directly from the planner panel.</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-400">Runtime algorithm</p>
            <p className="mt-2 text-2xl font-semibold text-white">{runMetadata.algorithm}</p>
            <p className="mt-1 text-sm text-slate-400">Matches the current execution bridge payload metadata.</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-400">Run bounds</p>
            <p className="mt-2 text-2xl font-semibold text-white">{runMetadata.episodes} ep</p>
            <p className="mt-1 text-sm text-slate-400">{runMetadata.max_steps_per_episode} max steps · seed {runMetadata.seed}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-400">Duration</p>
            <p className="mt-2 text-2xl font-semibold text-white">{durationDisplay}</p>
            <p className="mt-1 text-sm text-slate-400">{durationSubtitle}</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-5">
          <SectionCard
            title="Task input and planner routing"
            subtitle="Translate the user description into a structured RL problem statement and algorithm shortlist."
            icon={LayoutDashboard}
          >
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">Input dataset</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Load a CSV file to enrich planning context. In this prototype, the uploaded data shapes the prompt and scenario guidance only.
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-900 p-2 text-sky-300">
                    <FileSpreadsheet size={18} />
                  </div>
                </div>
                <label className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-400">
                  Load input CSV
                  <input type="file" accept=".csv,text/csv" onChange={handleFileUpload} className="hidden" />
                </label>
                <button
                  type="button"
                  onClick={loadSimulatedWarehouseCsv}
                  disabled={datasetLoading}
                  className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-sky-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {datasetLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  {datasetLoading ? 'Loading sample CSV…' : 'Load simulated warehouse CSV'}
                </button>

                {uploadedDataset ? (
                  <div className="mt-4 space-y-4">
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
                      <p className="font-medium text-white">{uploadedDataset.fileName}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {uploadedDataset.rowCount} rows · {uploadedDataset.columns.length} columns
                        {uploadedDataset.suggestedScenarioId ? ` · suggested scenario ${uploadedDataset.suggestedScenarioId}` : ''}
                      </p>
                    </div>

                    <label className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3">
                      <input
                        type="checkbox"
                        checked={useDatasetContext}
                        onChange={(event) => setUseDatasetContext(event.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-950 text-sky-500"
                      />
                      <div>
                        <p className="font-medium text-white">Use dataset context in prompt</p>
                        <p className="mt-1 text-xs text-slate-400">
                          Appends a compact summary of the uploaded file to the experiment description before simulated or live runs.
                        </p>
                      </div>
                    </label>

                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
                      <p className="font-medium text-white">Dataset summary</p>
                      <ul className="mt-2 space-y-1 text-xs text-slate-400">
                        <li><span className="text-slate-500">Columns:</span> {uploadedDataset.columns.join(', ')}</li>
                        <li><span className="text-slate-500">Numeric columns:</span> {uploadedDataset.numericColumns.join(', ') || 'none detected'}</li>
                        <li><span className="text-slate-500">Prompt mode:</span> {useDatasetContext ? 'dataset summary appended' : 'prompt only'}</li>
                      </ul>
                    </div>

                    <div className="overflow-auto rounded-xl border border-slate-800">
                      <table className="min-w-full text-xs">
                        <thead className="bg-slate-900 text-left text-slate-400">
                          <tr>
                            {uploadedDataset.columns.map((column) => (
                              <th key={column} className="px-3 py-2 font-medium">{column}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {uploadedDataset.previewRows.map((row) => (
                            <tr key={row.row_id} className="border-t border-slate-800 text-slate-200">
                              {uploadedDataset.columns.map((column) => (
                                <td key={`${row.row_id}-${column}`} className="px-3 py-2">{row[column]}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-xs text-slate-400">
                    The studio can auto-load <span className="font-medium text-slate-200">{SAMPLE_WAREHOUSE_CSV_PATH}</span> for the warehouse live prototype.
                  </p>
                )}
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
                <p className="font-medium text-white">Live run configuration</p>
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Execution mode</label>
                    <select
                      value={executionMode}
                      onChange={(event) => {
                        const nextMode = event.target.value;
                        setShouldAutoSuggestScenario(false);
                        setExecutionMode(nextMode);
                        setSelectedScenarioId(nextMode);
                      }}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500"
                    >
                      <option value="warehouse-robot">Warehouse robot</option>
                      <option value="microgrid-dispatch">Energy grid problem</option>
                      <option value="event-neuromorphic">Neuromorphic use case</option>
                    </select>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">Episodes</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={episodes}
                        onChange={(event) => setEpisodes(Math.min(100, Math.max(1, Number(event.target.value) || 1)))}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">Max steps</label>
                      <input
                        type="number"
                        min={1}
                        max={200}
                        value={maxStepsPerEpisode}
                        onChange={(event) => setMaxStepsPerEpisode(Math.min(200, Math.max(1, Number(event.target.value) || 1)))}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">Seed</label>
                      <input
                        type="number"
                        min={1}
                        max={999}
                        value={seed}
                        onChange={(event) => setSeed(Math.min(999, Math.max(1, Number(event.target.value) || 1)))}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500"
                      />
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-400">
                  Live mode is intentionally constrained to the warehouse scenario and bounded episodes so the studio remains interactive and safe.
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
                <p className="font-medium text-white">Planner output</p>
                <ul className="mt-3 space-y-2">
                  <li><span className="text-slate-500">Problem type:</span> {activeRun.planner.problem_type}</li>
                  <li><span className="text-slate-500">Environment:</span> {activeRun.planner.environment_definition}</li>
                  <li><span className="text-slate-500">Agent:</span> {activeRun.planner.agent_definition}</li>
                  <li><span className="text-slate-500">Network:</span> {activeRun.planner.network_definition}</li>
                  <li><span className="text-slate-500">Algorithm shortlist:</span> {selectedScenario.candidate_algorithms.join(', ')}</li>
                </ul>
                <p className="mt-3 text-slate-400">{activeRun.planner.rationale}</p>
              </div>
            </div>
          </SectionCard>

          <div className="xl:col-span-3">
            <SectionCard
              title="System design and execution loop"
              subtitle="The application mirrors the planner → coder → environment → evaluator → memory cycle in your diagram."
              icon={Play}
            >
              <div className="mb-6 rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-sm font-semibold text-white">Python-backed implementation contract</p>
                <p className="mt-2 text-sm text-slate-400">
                  Option A is now grounded in a shared backend module at <span className="font-medium text-slate-200">src/rl_agent_backend.py</span>.
                  The execution bridge now targets a JSON export from the backend so the UI can ingest a single payload for planner, metrics,
                  evaluation, and memory results.
                </p>
                {uploadedDataset && useDatasetContext ? (
                  <div className="mt-4 rounded-xl border border-sky-900 bg-sky-950/30 p-3 text-xs text-slate-300">
                    <p className="font-medium text-sky-300">Active uploaded dataset context</p>
                    <p className="mt-1">
                      {uploadedDataset.fileName} is currently enriching the prompt with {uploadedDataset.rowCount} rows and {uploadedDataset.columns.length} columns.
                    </p>
                  </div>
                ) : null}
                <div className="mt-4 overflow-auto rounded-xl border border-slate-800">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-900 text-left text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-medium">Module</th>
                        <th className="px-4 py-3 font-medium">Function</th>
                        <th className="px-4 py-3 font-medium">Purpose</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backendContract.map((row) => (
                        <tr key={row.function} className="border-t border-slate-800 text-slate-200">
                          <td className="px-4 py-3 font-medium text-white">{row.module}</td>
                          <td className="px-4 py-3">{row.function}</td>
                          <td className="px-4 py-3 text-slate-400">{row.purpose}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-xl border border-sky-900 bg-sky-950/40 p-4">
                  <p className="text-sm font-semibold text-sky-300">Planner</p>
                  <p className="mt-2 text-sm text-slate-300">Selects RL family, defines agent/environment, and picks network templates.</p>
                </div>
                <div className="rounded-xl border border-cyan-900 bg-cyan-950/30 p-4">
                  <p className="text-sm font-semibold text-cyan-300">Coder</p>
                  <p className="mt-2 text-sm text-slate-300">Generates training pipeline, reward logic, and experiment artifacts.</p>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
                  <p className="text-sm font-semibold text-slate-200">Environment</p>
                  <p className="mt-2 text-sm text-slate-300">Runs benchmark or synthetic simulator with the selected task dynamics.</p>
                </div>
                <div className="rounded-xl border border-emerald-900 bg-emerald-950/30 p-4">
                  <p className="text-sm font-semibold text-emerald-300">Evaluator</p>
                  <p className="mt-2 text-sm text-slate-300">Scores policy quality, convergence, baseline lift, and revision needs.</p>
                </div>
                <div className="rounded-xl border border-amber-900 bg-amber-950/30 p-4">
                  <p className="text-sm font-semibold text-amber-300">Memory</p>
                  <p className="mt-2 text-sm text-slate-300">Stores prior wins, evaluator feedback, and reusable design patterns.</p>
                </div>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 xl:col-span-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-300">Execution bridge payload sample</p>
                    <span className="rounded-full bg-sky-500/15 px-3 py-1 text-xs font-medium text-sky-300">
                      {selectedScenarioId === 'warehouse-robot'
                        ? `build_live_experiment_payload_json('${selectedScenarioId}', ${runMetadata.episodes}, ${runMetadata.max_steps_per_episode}, ${runMetadata.seed})`
                        : `build_experiment_payload_json('${selectedScenarioId}')`}
                    </span>
                  </div>
                  <pre className="mt-3 overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-300">
{JSON.stringify(bridgePayload, null, 2)}
                  </pre>
                </div>

                <div className="h-[320px] rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="mb-3 text-sm font-medium text-slate-300">Training reward curve</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activeRun.metrics} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                      <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                      <XAxis dataKey="episode" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="reward" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 3 }} name="Episode reward" />
                      <Line type="monotone" dataKey="moving_avg" stroke={COLORS.secondary} strokeWidth={2} dot={false} name="Moving average" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="h-[320px] rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="mb-3 text-sm font-medium text-slate-300">Learning success trend</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activeRun.metrics} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                      <defs>
                        <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.tertiary} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={COLORS.tertiary} stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                      <XAxis dataKey="episode" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 1]} />
                      <Tooltip
                        formatter={(value) => [`${Math.round(Number(value) * 100)}%`, 'Success rate']}
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                      />
                      <Area type="monotone" dataKey="success_rate" stroke={COLORS.tertiary} fill="url(#successGradient)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-5">
          <SectionCard
            title="Scenario design summary"
            subtitle="Core RL formulation inferred from the selected user request."
            icon={Target}
          >
            <div className="space-y-3 text-sm text-slate-300">
              <div>
                <p className="font-medium text-white">Domain</p>
                <p>{selectedScenario.domain}</p>
              </div>
              <div>
                <p className="font-medium text-white">Observations</p>
                <p>{selectedScenario.observations}</p>
              </div>
              <div>
                <p className="font-medium text-white">Actions</p>
                <p>{selectedScenario.actions}</p>
              </div>
              <div>
                <p className="font-medium text-white">Reward design</p>
                <p>{selectedScenario.reward}</p>
              </div>
              <div>
                <p className="font-medium text-white">Data strategy</p>
                <p>{selectedScenario.data_source}</p>
              </div>
              <div>
                <p className="font-medium text-white">Planned outputs</p>
                <p>{selectedScenario.output_format}</p>
              </div>
            </div>
          </SectionCard>

          <div className="xl:col-span-3">
            <SectionCard
              title="Evaluator scorecard"
              subtitle="The evaluator agent compares training output against baselines and returns revision guidance."
              icon={CheckCircle2}
            >
              <div className="overflow-auto rounded-xl border border-slate-800">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-950 text-left text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Metric</th>
                      <th className="px-4 py-3 font-medium">Experiment</th>
                      <th className="px-4 py-3 font-medium">Baseline</th>
                      <th className="px-4 py-3 font-medium">Interpretation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluationRows.map((row) => (
                      <tr key={row.metric} className="border-t border-slate-800 text-slate-200">
                        <td className="px-4 py-3 font-medium text-white">{row.metric}</td>
                        <td className="px-4 py-3">{row.experiment}</td>
                        <td className="px-4 py-3">{row.baseline}</td>
                        <td className="px-4 py-3 text-slate-400">{row.interpretation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-emerald-900 bg-emerald-950/30 p-4">
                  <p className="text-sm font-semibold text-emerald-300">Learning assessment</p>
                  <p className="mt-2 text-sm text-slate-300">{activeRun.outputs.learning_status}</p>
                </div>
                <div className="rounded-xl border border-amber-900 bg-amber-950/30 p-4">
                  <p className="text-sm font-semibold text-amber-300">Recommended next iteration</p>
                  <p className="mt-2 text-sm text-slate-300">{activeRun.outputs.evaluator_feedback}</p>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-5">
          <SectionCard
            title="Memory and learning"
            subtitle="Prior runs guide algorithm selection, reward shaping, and experiment prioritization."
            icon={Database}
          >
            <div className="space-y-3">
              {bridgePayload.memory.map((memory) => (
                <div key={memory.task} className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-300">
                  <p className="font-medium text-white">{memory.task}</p>
                  <p className="mt-1">Winning algorithm: {memory.winning_algorithm}</p>
                  <p className="mt-1 text-slate-400">{memory.improvement}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <div className="xl:col-span-3">
            <SectionCard
              title="Generated research artifacts"
              subtitle="The execution environment returns outputs in text, table, and plot form for RL analysis."
              icon={LayoutDashboard}
            >
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                <div className="h-[260px] rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="mb-3 text-sm font-medium text-slate-300">Artifact volume by format</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={renderedArtifacts.map((artifact, index) => ({
                        name: artifact.format,
                        count: index + 1,
                      }))}
                      margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                      />
                      <Bar dataKey="count" fill={COLORS.warning} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="h-[260px] rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="mb-3 text-sm font-medium text-slate-300">Reward curve artifact</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activeRun.metrics} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                      <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                      <XAxis dataKey="episode" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="reward" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="moving_avg" stroke={COLORS.secondary} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="h-[260px] rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="mb-3 text-sm font-medium text-slate-300">Success artifact preview</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activeRun.metrics} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                      <defs>
                        <linearGradient id="artifactSuccessGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.tertiary} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={COLORS.tertiary} stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                      <XAxis dataKey="episode" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 1]} />
                      <Tooltip
                        formatter={(value) => [`${Math.round(Number(value) * 100)}%`, 'Success rate']}
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                      />
                      <Area type="monotone" dataKey="success_rate" stroke={COLORS.tertiary} fill="url(#artifactSuccessGradient)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 lg:col-span-2 xl:col-span-3">
                  <p className="mb-3 text-sm font-medium text-slate-300">Policy summary artifact</p>
                  <div className="overflow-auto rounded-xl border border-slate-800">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-900 text-left text-slate-400">
                        <tr>
                          <th className="px-4 py-3 font-medium">Metric</th>
                          <th className="px-4 py-3 font-medium">Value</th>
                          <th className="px-4 py-3 font-medium">Interpretation</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-slate-800 text-slate-200">
                          <td className="px-4 py-3 font-medium text-white">Selected algorithm</td>
                          <td className="px-4 py-3">{runMetadata.algorithm}</td>
                          <td className="px-4 py-3 text-slate-400">Runtime algorithm selected for the current execution mode.</td>
                        </tr>
                        <tr className="border-t border-slate-800 text-slate-200">
                          <td className="px-4 py-3 font-medium text-white">Average return</td>
                          <td className="px-4 py-3">{activeRun.outputs.average_return}</td>
                          <td className="px-4 py-3 text-slate-400">Mean reward achieved across the synthetic or live training trace.</td>
                        </tr>
                        <tr className="border-t border-slate-800 text-slate-200">
                          <td className="px-4 py-3 font-medium text-white">Best episode return</td>
                          <td className="px-4 py-3">{activeRun.outputs.best_episode_return}</td>
                          <td className="px-4 py-3 text-slate-400">Highest single-episode reward in the displayed experiment window.</td>
                        </tr>
                        <tr className="border-t border-slate-800 text-slate-200">
                          <td className="px-4 py-3 font-medium text-white">Latest success rate</td>
                          <td className="px-4 py-3">{stats.successRate}</td>
                          <td className="px-4 py-3 text-slate-400">End-of-run success probability derived from the bridge payload metrics.</td>
                        </tr>
                        <tr className="border-t border-slate-800 text-slate-200">
                          <td className="px-4 py-3 font-medium text-white">Run mode and bounds</td>
                          <td className="px-4 py-3">{runMetadata.mode} · {runMetadata.episodes} ep / {runMetadata.max_steps_per_episode} steps</td>
                          <td className="px-4 py-3 text-slate-400">Shows whether the result came from a simulated bridge payload or the bounded live warehouse runner.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 lg:col-span-2 xl:col-span-3">
                  <p className="mb-3 text-sm font-medium text-slate-300">Artifact manifest</p>
                  <div className="space-y-3">
                    {renderedArtifacts.map((artifact) => (
                      <div key={artifact.name} className="rounded-xl border border-slate-800 bg-slate-900 p-3">
                        <p className="font-medium text-white">{artifact.name}</p>
                        <p className="mt-1 text-sm text-slate-400">{artifact.format}</p>
                        <p className="mt-1 text-sm text-slate-300">{artifact.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-sky-900 bg-sky-950/30 p-4 text-sm text-slate-300">
                <p className="font-semibold text-sky-300">System narrative</p>
                <p className="mt-2">
                  The reward curve, policy summary table, and success preview together show how the planner, execution environment,
                  evaluator, and memory loop cooperate inside the RL Agent Studio. The planner first classifies the scenario and selects
                  an RL family with an appropriate network shape. The execution layer then produces a bridge payload containing metrics,
                  evaluation outputs, reusable memory patterns, and explicit run metadata. For the warehouse scenario, the studio can now
                  switch into a bounded live Q-learning path so the artifacts reflect a small real training job instead of a purely static payload.
                  When you upload a CSV file, the studio also folds that dataset summary into the planning prompt so demos can incorporate realistic input context without requiring full backend retraining.
                  Finally, the evaluator interprets convergence quality, compares the learned policy against a baseline, and feeds recommendations
                  back into the next experiment cycle. This makes the artifact section a compact research report rather than a static manifest.
                </p>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}