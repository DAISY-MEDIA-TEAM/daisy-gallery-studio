// Self-check for topic() keywords: node topic.check.js (run after editing TOPICS in templates.js)
const assert = require('node:assert');
global.window = {};
const { topic } = new Function(require('fs').readFileSync(__dirname + '/templates.js', 'utf8') + ';return { topic };')();
const cases = {
  'Task-Dependent Benchmarking of Generative Transport Models for Reconstructing ALS Motor Neuron Transcriptomic Dynamics': 'bio',
  'PRAR-SP: Predictive Resource-Aware Entanglement Routing with a Symmetric Prior for Memory-Constrained Quantum Networks': 'quantum',
  'Adaptive Residual-Graph Steiner-Tree Routing for Contended GHZ Multicast in Quantum Networks': 'quantum',
  'Subject-Independent WGAN-GP Augmentation for Minority-Class ALS Detection in Imbalanced EEG Classification': 'bio',
  'Motor imagery decoding from EEG signals with wavelet features': 'signal',
  'RAG-Grounded Graph Attention Networks for Feature Selection in Network Intrusion Detection': 'security',
  'Lightweight Graph Learning for Intrusion Detection in Large-Scale IoT Networks': 'security',
  'ECG-based arrhythmia diagnosis for cardiac patients': 'health',
  'Retrieval-augmented question answering over Vietnamese legal documents': 'data',
  'Task offloading and scheduling for UAV-assisted edge computing': 'system',
  'Link prediction on dynamic social graphs': 'network',
  'Vision transformers for image classification with deep neural networks': 'ai',
  'A new approach': 'ai',
};
for (const [t, want] of Object.entries(cases)) assert.strictEqual(topic(t), want, t);
console.log(`topic(): ${Object.keys(cases).length} cases ok`);
