import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

const chapters = [
  ['01', 'LLM fundamentals', 'Tokens, embeddings, attention, architectures, and decoding.', '/docs/llm-fundamentals'],
  ['02', 'Prompting + RAG', 'Make model behavior useful, grounded, and testable.', '/docs/prompt-engineering-and-rag'],
  ['03', 'Data preparation', 'Build clean, attributable data pipelines and splits.', '/docs/data-preparation'],
  ['04', 'Optimization', 'Quantization, distillation, KV cache, and real tradeoffs.', '/docs/model-optimization'],
  ['05', 'Fine-tuning', 'SFT, LoRA, preference learning, and alignment.', '/docs/fine-tuning-and-alignment'],
  ['06', 'Evaluation', 'Measure quality, retrieval, reliability, and regressions.', '/docs/evaluation'],
  ['07', 'GPU systems', 'Memory, parallelism, precision, and profiling.', '/docs/gpu-acceleration-and-optimization'],
  ['08', 'Deployment', 'Serving, batching, orchestration, and rollout.', '/docs/model-deployment'],
  ['09', 'Reliability', 'Observability, incident response, and versioning.', '/docs/production-monitoring-and-reliability'],
  ['10', 'Safety', 'Guardrails, risk, privacy, and responsible AI.', '/docs/safety-ethics-and-compliance'],
] as const;

export default function Home(): ReactNode {
  return (
    <Layout title="Learn LLMs from first principles" description="A concept-first learning library for NVIDIA Gen AI LLM certification preparation.">
      <main>
        <section className={styles.hero}>
          <div className={styles.orbit} aria-hidden="true"><span /><span /><span /></div>
          <div className={styles.heroInner}>
            <p className={styles.kicker}>CONCEPT-FIRST LEARNING LIBRARY</p>
            <Heading as="h1">Build the mental model.<br />Then build the systems.</Heading>
            <p className={styles.lede}>LLM Basics turns a dense certification map into a calm, practical curriculum: theory, tradeoffs, mini-labs, and the resources worth your time.</p>
            <div className={styles.actions}>
              <Link className={styles.primaryAction} to="/docs/llm-fundamentals">Begin with LLM fundamentals <span>↗</span></Link>
              <Link className={styles.secondaryAction} to="/docs/">See the study path</Link>
            </div>
            <dl className={styles.stats}>
              <div><dt>10</dt><dd>connected chapters</dd></div>
              <div><dt>7–10h</dt><dd>per foundation block</dd></div>
              <div><dt>1 goal</dt><dd>understand before testing</dd></div>
            </dl>
          </div>
        </section>

        <section className={styles.principle}>
          <p className={styles.sectionLabel}>THE APPROACH</p>
          <Heading as="h2">No acronym collecting.</Heading>
          <p>You will learn to choose an approach, predict its tradeoffs, and diagnose what broke. That is the difference between recognizing a term and being able to use it.</p>
        </section>

        <section className={styles.mapSection}>
          <div className={styles.mapIntro}>
            <p className={styles.sectionLabel}>THE LEARNING MAP</p>
            <Heading as="h2">Ten chapters. One connected system.</Heading>
            <p>Start where every practical decision starts: with how a model represents and generates language. Then move outward—data, adaptation, systems, operations, and safety.</p>
          </div>
          <ol className={styles.chapterGrid}>
            {chapters.map(([number, title, description, to]) => (
              <li key={number}>
                <Link to={to}>
                  <span className={styles.chapterNumber}>{number}</span>
                  <span className={styles.chapterTitle}>{title}</span>
                  <span className={styles.chapterDescription}>{description}</span>
                  <span className={styles.chapterArrow}>Explore ↗</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.startSection}>
          <div>
            <p className={styles.sectionLabel}>START HERE</p>
            <Heading as="h2">Understand attention before you optimize it.</Heading>
          </div>
          <p>Chapter 1 gives you the vocabulary and intuition behind tokens, embeddings, transformer blocks, self-attention, model families, decoding, and KV cache.</p>
          <Link className={styles.primaryAction} to="/docs/llm-fundamentals">Open Chapter 1 <span>↗</span></Link>
        </section>
      </main>
    </Layout>
  );
}
