#RL Research agent README.md
#Developed by Krishnamurthy Vemuru using Ascend.io

# Otto's Expeditions

A sample Ascend project for the fictional Otto's Expeditions enterprise, demonstrating multi-platform data pipelines across BigQuery, Databricks, DuckDB, MotherDuck, and Snowflake.

## Project Structure

| Directory | Description |
|-----------|-------------|
| `automations/` | Event-driven and scheduled workflow triggers |
| `connections/` | Data plane and source connections |
| `data/` | Local CSV files for testing |
| `flows/` | Data pipelines organized by platform |
| `macros/` | Reusable Jinja SQL templates |
| `otto/` | AI agent configuration and customization |
| `profiles/` | Environment-specific parameters |
| `src/` | Shared Python modules |
| `applications/` | Interactive data applications and research dashboards |
| `templates/` | Simple Application templates |
| `vaults/` | External credential stores |

## Applications

- `applications/rl-research-agent-q9Lm2sVb/rl-research-agent.tsx` — RL Research Agent Studio for planner/evaluator/memory workflow exploration
- `applications/goats-demo-explorer-bZgsw8uR/goats-demo-explorer.tsx` — synthetic operations demo explorer
- `applications/weather-carbon-optimization-dashboard-x7K2mN9p/weather-carbon-optimization-dashboard.tsx` — carbon optimization dashboard

## RL Research Agent Backend

The RL Research Agent application uses shared Python helpers in @src/rl_agent_backend.py.

The current RL Research Agent Studio is a prototype UI and backend contract. It supports three selectable experiment modes in the dashboard:

- warehouse robot
- energy grid problem
- neuromorphic use case

The warehouse robot option uses the bounded live Q-learning path, while the other two currently use simulated experiment payloads.

For the warehouse robot scenario, both the bounded live demo and the default simulated bridge payload now expose a 30-episode training window in the studio.

Current backend responsibilities:

- scenario definitions for RL research use cases
- planner outputs for algorithm, agent, and environment selection
- synthetic training metric generation
- bounded live Q-learning execution for the warehouse robot scenario
- evaluator summaries and reusable experiment memory
- JSON execution-bridge payload generation for the application UI

Current studio layout highlights:

- **Research Scenario** and **User Task Description** appear directly below the main header and **Run experiment** button
- the planner panel contains the dataset controls, experiment selector, run bounds, and planner output details
- the execution bridge payload preview updates to match the currently selected experiment mode

## RL Research Agent Sample Input Data

- `data/warehouse_robot_episode_seed.csv` — simulated warehouse robot episode data for the bounded live Q-learning prototype

Use this file as the default demo dataset in the RL Research Agent Studio. The rows model warehouse episodes with order routing context, congestion, battery state, path efficiency, completion outcome, and reward snapshots.

The sample file aligns with the 30-episode warehouse demonstrations shown in the studio's payload preview, reward curve, and success trend charts.

Current studio dataset workflow:

- open `applications/rl-research-agent-q9Lm2sVb/rl-research-agent.tsx` in Preview
- the studio auto-loads `data/warehouse_robot_episode_seed.csv` on startup when local file querying is available
- optionally click **Load simulated warehouse CSV** to reload the project sample file
- or click **Load input CSV** to choose your own compatible CSV
- switch experiment modes with the selector in the planner panel to move between warehouse, energy grid, and neuromorphic demos
- review the inferred columns, preview rows, and suggested scenario
- keep **Use dataset context in prompt** enabled to append a compact dataset summary to the experiment description

The current dataset behavior is intentionally prototype-scoped:

- the project sample CSV is discovered by the application through the fixed path `data/warehouse_robot_episode_seed.csv`
- uploaded or auto-loaded CSV content enriches planning context, prompt framing, preview rows, and scenario suggestion in the UI
- CSV content does not yet trigger true backend retraining or replace the bounded live Q-learning backend logic

## Flows by Platform

Each platform has a consistent set of flows:

- **Extract-Load**: Ingest data from GCS and local files
- **Transform**: Business logic transformations
- **Metrics**: Aggregated analytics

Platforms: #flow:extract-load-bigquery, #flow:extract-load-databricks, #flow:extract-load-duckdb, #flow:extract-load-snowflake, #flow:extract-load-motherduck

## Getting Started

1. Create a workspace with an appropriate profile from `profiles/`
2. Configure your data plane connection parameters
3. Run the extract-load flow for your platform
4. Run the transform flow to process the data