from collections import Counter
from pathlib import Path
import datetime
import json
import re

git_url_pattern = re.compile(r'(https://[^ ]+?)(?:(?:\.git)$|$)')


def validate_index(index_path: Path):
    with open(index_path) as inf:
        d = json.load(inf)

        for agent in d["agents"]:
            for required_key in [
                "name",
                "url",
                "description",
                "created",
            ]:
                assert required_key in agent, f"missing key: {required_key}"

            datetime.date.fromisoformat(
                agent['created']), "Incorrect data format, should be YYYY-MM-DD"


def validate_entry(file: Path):

    try:
        with open(file, 'r') as f:
            agent = json.load(f)
    except Exception as e:
        exit(f"::error::{file.relative_to(Path().absolute())} : {e}")

    for required_key in [
        "name",
        "url",
        "description",
    ]:
        assert required_key in agent, f"{file} missing key: {required_key}"

    if agent.get('created'):
        try:
            datetime.date.fromisoformat(agent.get('created'))
        except:
            assert False, f"{file} Incorrect created data format, YYYY-MM-DD"
    git_url = git_url_pattern.match(agent['url'])
    assert git_url, f'invalid URL: "{agent["url"]}"'
    return git_url.group(1)


def validate_agent_entrys(ext_dir: Path):
    urls = []
    for f in Path(ext_dir).iterdir():
        if f.is_file() and f.suffix.lower() == '.json':
            urls.append(validate_entry(f))
    counts = Counter(urls)
    duplicates = [element for element, count in counts.items() if count > 1]
    assert len(duplicates) == 0, f'duplicate agent: {duplicates}'
    print(counts)


if __name__ == "__main__":
    base_dir = Path(__file__).parent.parent.parent

    validate_agent_entrys(base_dir.joinpath('agents'))

    validate_index(base_dir.joinpath('index.json'))
