import spacy
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from collections import Counter
import nltk
import ctypes
import os

# Download necessary NLTK data
nltk.download('vader_lexicon')
nltk.download('punkt')

from elasticsearch import Elasticsearch

class TextProcessor:
    def __init__(self, es_host='http://localhost:9200', es_index='documents'):
        try:
            self.nlp = spacy.load('en_core_web_sm')
        except OSError:
            print('Downloading spaCy model...')
            from spacy.cli.download import download
            download('en_core_web_sm')
            self.nlp = spacy.load('en_core_web_sm')
        # Bad words list (expand as needed)
        self.bad_words = {'badword1', 'badword2', 'badword3'}
        # Elasticsearch setup
        self.es = Elasticsearch(es_host)
        self.es_index = es_index
        # Create index if not exists
        if not self.es.indices.exists(index=self.es_index):
            self.es.indices.create(index=self.es_index)

    def detect_bad_words(self, text):
        """Return list of detected bad words in text."""
        words = set(word.lower() for word in text.split())
        found = list(words & self.bad_words)
        return found

    def has_bad_words(self, text):
        """Return True if any bad word is present."""
        return bool(self.detect_bad_words(text))

    def index_document(self, doc_id, text, metadata=None):
        """Index a document in Elasticsearch."""
        body = {'text': text}
        if metadata:
            body['metadata'] = metadata
        self.es.index(index=self.es_index, id=doc_id, body=body)

    def search_documents(self, query, size=10):
        """Search documents in Elasticsearch."""
        search_body = {
            'query': {
                'multi_match': {
                    'query': query,
                    'fields': ['text', 'metadata.*']
                }
            }
        }
        res = self.es.search(index=self.es_index, body=search_body, size=size)
        return res['hits']['hits']

        self.sentiment_analyzer = SentimentIntensityAnalyzer()
        
        # Load the C++ shared library
        lib_path = os.path.join(os.path.dirname(__file__), '..', 'cpp_engine', 'lib_process_data.so')
        self.cpp_lib = ctypes.CDLL(lib_path)
        self.cpp_lib.process_data.argtypes = [ctypes.c_int, ctypes.c_int]
        self.cpp_lib.process_data.restype = ctypes.c_int

    def process_text(self, text):
        doc = self.nlp(text)

        # Named Entity Recognition
        entities = [{'text': ent.text, 'label': ent.label_} for ent in doc.ents]

        # Keyword Extraction (simple version using noun chunks)
        keywords = [chunk.text for chunk in doc.noun_chunks]

        # Sentiment Analysis
        sentiment = self.sentiment_analyzer.polarity_scores(text)

        # Example of calling C++ function
        cpp_result = self.cpp_lib.process_data(10, 20)

        return {
            'entities': entities,
            'keywords': keywords,
            'sentiment': sentiment,
            'cpp_result': cpp_result
        }

# Example usage:
if __name__ == '__main__':
    import sys
    import json

    processor = TextProcessor()
    input_data = json.load(sys.stdin)
    text = input_data.get('text', '')
    analysis = processor.process_text(text)
    print(json.dumps(analysis))