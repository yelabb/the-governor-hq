# @the-governor-hq/constitution-bci

**AI Safety Constitution for Brain-Computer Interface (BCI) Data Projects**

AI behavior guidance layer working with consumer BCI/neurotechnology data (EEG, fNIRS, neurofeedback devices). Prescriptive, executable constraints that prevent neurological claims, mental state interpretation, and ensure ethical boundaries.

## Quick Start

```bash
npm install --save-dev @the-governor-hq/constitution-bci
```

Then run setup to configure your AI tools:

```bash
npx governor-install-bci
```

## What It Covers

### BCI Data Types
- **EEG (Electroencephalography)** - Brain wave patterns
- **fNIRS (Functional Near-Infrared Spectroscopy)** - Blood flow in brain
- **Neurofeedback signals** - Real-time brainwave monitoring
- **Focus/attention metrics** - Derived cognitive state estimates
- **Brain state classifications** - Sleep stages, relaxation, focus
- **Event-related potentials (ERPs)** - Response to stimuli

### BCI-Specific Safety Rules

Beyond the universal core rules, BCI systems must:

- ❌ **No mental state diagnosis** - Never claim to diagnose ADD, ADHD, depression, anxiety, etc.
- ❌ **No emotion interpretation** - Cannot definitively state emotional states from brain signals
- ❌ **No cognitive ability claims** - Avoid statements about intelligence, learning disabilities, or cognitive disorders
- ❌ **No neurological diagnoses** - Never suggest epilepsy, dementia, brain injuries, or other conditions
- ❌ **No treatment claims** - Cannot position neurofeedback as treatment for medical conditions
- ❌ **No thought reading** - Brain signals are patterns, not mind reading
- ❌ **Privacy critical** - Neural data is highly sensitive, requires explicit consent

### Allowed BCI Applications (Consumer Wellness)

✅ **Focus pattern recognition** - "Your focus patterns suggest..."  
✅ **Meditation guidance** - "Brain activity indicates relaxation..."  
✅ **Sleep stage estimation** - "EEG suggests you're in light sleep..."  
✅ **Attention training** - "Practice maintaining focus when you see..."  
✅ **Neurofeedback for relaxation** - "When alpha waves increase, try..."  
✅ **Personal baseline learning** - "Your typical brain patterns show..."  

### What BCI Systems Are NOT

| It is NOT... | Explanation |
|---|---|
| **A medical diagnostic tool** | Cannot diagnose neurological or psychiatric conditions |
| **Mind reading** | Brain signals are patterns, not thoughts or feelings |
| **Lie detection** | Cannot determine truthfulness or deception |
| **Intelligence testing** | Cannot measure IQ or cognitive abilities |
| **Clinical neurofeedback** | Not a replacement for medical neurofeedback therapy |
| **Mental health diagnosis** | Cannot diagnose depression, anxiety, ADHD, etc. |

## Core BCI Principles

| Principle | Detail |
|---|---|
| **Personal baseline** | Must learn individual brain patterns (30–90 days minimum) |
| **Pattern recognition** | Identify trends, not make definitive state claims |
| **Non-diagnostic** | No neurological or psychiatric diagnoses |
| **Consumer wellness** | Focus on meditation, focus training, relaxation |
| **Privacy paramount** | Neural data requires strictest privacy controls |
| **Informed consent** | Users must fully understand what brain data reveals |

## Example Use Cases

✅ **Meditation apps** - Help users achieve relaxed states via neurofeedback  
✅ **Focus trainers** - Practice sustaining attention with real-time feedback  
✅ **Sleep optimization** - Learn about personal sleep architecture  
✅ **Stress awareness** - Notice patterns in brain activity during stress  
✅ **Neurofeedback games** - Control game elements with focus/relaxation  

❌ **ADHD diagnosis apps** - Cannot diagnose attention disorders  
❌ **Depression detectors** - Cannot diagnose mental health conditions  
❌ **Lie detection systems** - Cannot determine truthfulness  
❌ **Cognitive enhancement claims** - Cannot claim to increase IQ  

## Documentation

- 📖 [Full Documentation](https://the-governor-hq.vercel.app)
- 🐙 [GitHub Repository](https://github.com/the-governor-hq/constitution)

## Related Packages

- [`@the-governor-hq/constitution-core`](../core) - Core safety infrastructure (auto-installed)
- [`@the-governor-hq/constitution-wearables`](../wearables) - Smartwatch/fitness tracker data
- [`@the-governor-hq/constitution-therapy`](../therapy) - Therapy and mental health data

## License

MIT
