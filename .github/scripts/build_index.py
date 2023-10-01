from argparse import ArgumentParser
from pathlib import Path
import datetime
import json

import validate


def read_agent(file: Path):
    with open(file, 'r') as f:
        agent = json.load(f)
    for required_key in [
        "name",
        "url",
        "description",
    ]:
        assert required_key in agent, f"{file} missing key: {required_key}"

    try:
        datetime.date.fromisoformat(agent.get('created'))
    except:
        # add "created": "YYYY-MM-DD"
        agent["created"] = str(datetime.datetime.now().date())
        with open(file, 'w') as f:
            json.dump(agent, f, indent=4)
    return agent


def read_agent_dir():
    agents = {}
    for f in agents_dir.iterdir():
        if f.is_file() and f.suffix.lower() == '.json':
            agent = read_agent(f)
            agents[agent['url']] = agent
    return agents


def update_index(exts: dict):
    # update existing remove removed and add new agents
    with open(build_index_path, 'r') as f:
        existing_agents = {extension['url']: extension for extension in json.load(f)[
            'agents']}

    for agents_url, extension in exts.items():
        if agents_url in existing_agents.keys():
            existing_agents[agents_url].update(extension)
        else:
            existing_agents[agents_url] = extension
    agents_list = [extension for agents_url,
                   extension in existing_agents.items() if agents_url in agents]
    extension_index = {'agents': agents_list}

    with open(build_index_path, 'w') as f:
        json.dump(extension_index, f, indent=4)
    return extension_index


def update_main_index(index: dict):
    # add keys from main/index that are not in agents to agents as new main/index
    with open(deploy_index_path, 'r') as f:
        main_exts = {agents['url']: agent for agent in json.load(f)[
            'agents']}

    index_ext = {agent['url']: agent for agent in index['agents']}
    index_ext_urls = index_ext.keys()
    for main_ext_url, main_ext in main_exts.items():
        if main_ext_url in index_ext_urls:
            index_ext_keys = index_ext[main_ext_url].keys()
            for main_exts_key in main_ext.keys():
                if main_exts_key not in index_ext_keys:
                    index_ext[main_ext_url][main_exts_key] = main_ext[main_exts_key]

    new_main_index = {
        'agents': list(index_ext.values())}
    with open(deploy_index_path, 'w') as f:
        json.dump(new_main_index, f, indent=4)
    return new_main_index


if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("--build-branch", "-b", type=str,
                        default='', required=False)
    parser.add_argument("--deploy-branch", "-d", type=str,
                        default='', required=False)
    args = parser.parse_args()

    build_index_path = Path(args.build_branch).joinpath('index.json')
    deploy_index_path = Path(args.deploy_branch).joinpath('index.json')
    agents_dir = Path(args.build_branch).joinpath('agents')

    # read entries
    agents = read_agent_dir()

    # update indexs
    agent_index_ext = update_index(agents)
    agent_index_main = update_main_index(agent_index_ext)

    # validate
    validate.validate_index(build_index_path)
    validate.validate_index(deploy_index_path)

    assert len(agent_index_ext["agents"]) == len(agent_index_main["agents"]
                                                 ), f'entry count mismatch: {len(agent_index_ext["agents"])} {len(agent_index_main["agents"])}'
    print(
        f'::notice::{len(agent_index_ext["agents"])} agents')
