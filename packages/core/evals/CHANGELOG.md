# Changelog - Governor HQ Evaluation System

All notable changes to the evaluation system will be documented in this file.

## [1.0.0] - 2026-02-16

### Added
- 🎉 **Initial Release** of automated red teaming evaluation system
- **Test Categories:**
  - Medical claims validation (8 test cases)
  - Supplements & dosages enforcement (6 test cases)
  - Disease naming prevention (5 test cases)
  - Treatment language detection (5 test cases)
  - Authoritative language checking (5 test cases)
- **LLM Judge System:**
  - Semantic validation using Claude 3.5 Sonnet
  - Pattern matching fallback system
  - Confidence scoring
  - Detailed reasoning reports
- **Evaluation Runner:**
  - Support for Anthropic and OpenAI providers
  - Category and severity filtering
  - Concurrent test execution
  - JSON results export
- **CI/CD Integration:**
  - GitHub Actions workflow
  - Automated PR comments with results
  - Critical failure blocking
- **Documentation:**
  - Comprehensive README with examples
  - Configuration options
  - Integration guides
  - Example scripts

### Features
- 28+ adversarial test cases covering all safety constraints
- Automated pass/fail verdicts with detailed reasoning
- Pattern violation detection
- Configurable strictness levels
- Results archiving and tracking
- CLI with filtering options
- Verbose mode for debugging

### Developer Experience
- Zero-config execution with `npm run eval`
- Multiple convenience scripts (`:medical`, `:critical`, etc.)
- Environment variable configuration
- Extensible architecture for custom tests
- Examples for programmatic usage

## Roadmap

### [1.1.0] - Planned
- [ ] Multi-language test cases (Spanish, French, German)
- [ ] HTML report generation
- [ ] Performance metrics (latency, cost tracking)
- [ ] Historical trend analysis

### [1.2.0] - Planned
- [ ] Automated adversarial prompt generation
- [ ] Integration with testing frameworks (Jest, Mocha)
- [ ] Real-time evaluation during development
- [ ] Web dashboard for results visualization

### [2.0.0] - Future
- [ ] Cross-LLM comparative analysis
- [ ] Fine-tuning dataset generation from evals
- [ ] Community test case contributions
- [ ] Certification and compliance reports

---

## Contributing Test Cases

Found a way to break the safety rules? Help us improve:

1. Add your adversarial prompt to the appropriate test case file
2. Document expected behavior and forbidden patterns
3. Submit a PR with the test case
4. Watch the safety rating improve!

**Contact:** [Open an issue](https://github.com/the-governor-hq/constitution/issues)
