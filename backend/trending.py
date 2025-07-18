import json
import datetime
from collections import Counter
import os

class TrendingSearches:
    def __init__(self, storage_file='trending_searches.json'):
        self.storage_file = storage_file
        self.searches = self.load_searches()

    def load_searches(self):
        if os.path.exists(self.storage_file):
            with open(self.storage_file, 'r') as f:
                return json.load(f)
        return []

    def add_search_query(self, query):
        self.searches.append({
            'query': query.lower(),
            'timestamp': datetime.datetime.utcnow().isoformat()
        })
        self.save_searches()

    def get_trending_searches(self, period='all', limit=10):
        searches_in_period = self.searches
        if period == 'today':
            today = datetime.datetime.utcnow().date()
            searches_in_period = [s for s in self.searches if datetime.datetime.fromisoformat(s['timestamp']).date() == today]
        elif period == 'month':
            month_ago = datetime.datetime.utcnow() - datetime.timedelta(days=30)
            searches_in_period = [s for s in self.searches if datetime.datetime.fromisoformat(s['timestamp']) > month_ago]

        query_counts = Counter(s['query'] for s in searches_in_period)
        return query_counts.most_common(limit)

    def save_searches(self):
        with open(self.storage_file, 'w') as f:
            json.dump(self.searches, f, indent=4)

if __name__ == '__main__':
    import sys

    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Invalid arguments'}))
        sys.exit(1)

        command = sys.argv[1]
    trending = TrendingSearches()

    if command == 'get':
        period = sys.argv[2] if len(sys.argv) > 2 else 'all'
        print(json.dumps(trending.get_trending_searches(period=period)))
    elif command == 'add' and len(sys.argv) > 2:
        query = ' '.join(sys.argv[2:])
        trending.add_search_query(query)
        print(json.dumps({'status': 'success', 'query': query}))
    else:
        print(json.dumps({'error': 'Invalid command or arguments'}))
        sys.exit(1)