import json
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models import (
    Reading, Summary, PersonalNote, IdeaCard, Flashcard, 
    DiscussionQuestion, RecallTest, RecallTestItem, ExperimentSession,
    VerificationRecord, PromptTemplate, PromptVersion, PromptTestRun,
    Reflection, AIToolLog
)

def utc_now():
    return datetime.now(timezone.utc)

def seed_database(db: Session, force: bool = False):
    """Seed the database with 5 complete, rich academic readings and study records."""
    existing_count = db.query(Reading).count()
    if existing_count > 0 and not force:
        return {"status": "skipped", "message": f"Database already contains {existing_count} readings."}

    if force:
        # Clear existing data in reverse order of relationships
        db.query(PromptTestRun).delete()
        db.query(PromptVersion).delete()
        db.query(PromptTemplate).delete()
        db.query(AIToolLog).delete()
        db.query(Reflection).delete()
        db.query(VerificationRecord).delete()
        db.query(ExperimentSession).delete()
        db.query(RecallTestItem).delete()
        db.query(RecallTest).delete()
        db.query(DiscussionQuestion).delete()
        db.query(Flashcard).delete()
        db.query(IdeaCard).delete()
        db.query(PersonalNote).delete()
        db.query(Summary).delete()
        db.query(Reading).delete()
        db.commit()

    now = utc_now()
    one_day_ago = now - timedelta(days=1)
    two_days_ago = now - timedelta(days=2)
    three_days_ago = now - timedelta(days=3)
    four_days_ago = now - timedelta(days=4)
    five_days_ago = now - timedelta(days=5)
    seven_days_ago = now - timedelta(days=7)

    # 1. Reading: Attention Is All You Need
    text_1 = """The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train.

Recurrent neural networks, particularly long short-term memory (LSTM) and gated recurrent neural networks, have been firmly established as state of the art approaches in sequence modeling. Recurrent models inherently factor computation along the symbol positions of the input and output sequences. This inherent sequential nature precludes parallelization within training examples, which becomes critical at longer sequence lengths, as memory constraints limit batching across examples.

Attention mechanisms have become an integral part of compelling sequence modeling and transduction models in various tasks, allowing modeling of dependencies without regard to their distance in the input or output sequences. In all but a few cases, however, such attention mechanisms are used in conjunction with a recurrent network.

In this work we propose the Transformer, a model architecture eschewing recurrence and instead relying entirely on an attention mechanism to draw global dependencies between input and output. The Transformer allows for significantly more parallelization and can reach a new state of the art in translation quality after being trained for as little as twelve hours on eight P100 GPUs. An attention function can be described as mapping a query and a set of key-value pairs to an output, where the query, keys, values, and output are all vectors. Multi-Head Attention allows the model to jointly attend to information from different representation subspaces at different positions."""

    reading_1 = Reading(
        title="Attention Is All You Need: The Transformer Architecture",
        author="Ashish Vaswani, Noam Shazeer, Niki Parmar et al.",
        source_url="https://arxiv.org/abs/1706.03762",
        topic="Artificial Intelligence",
        reading_date="2026-10-10",
        status="completed",
        completion_date="2026-10-10",
        content=text_1,
        word_count=len(text_1.split()),
        char_count=len(text_1),
        created_at=five_days_ago,
        updated_at=five_days_ago
    )
    db.add(reading_1)
    db.flush()

    db.add(Summary(
        reading_id=reading_1.id,
        quick_summary="The Transformer architecture eliminates recurrence and convolutions entirely, utilizing multi-head self-attention mechanisms to model global dependencies in sequences. This yields superior translation quality while drastically accelerating training parallelization.",
        standard_summary="Vaswani et al. introduce the Transformer, a breakthrough neural sequence transduction architecture. Traditional recurrent models (like LSTMs) suffer from sequential computation bottlenecks that prevent parallel execution across sequence lengths. By replacing recurrence entirely with scaled dot-product multi-head attention and positional encodings, the Transformer maps relationships across tokens in constant computation steps. Trained in only 12 hours on 8 GPUs, it set new state-of-the-art benchmarks in English-to-German and English-to-French translation with higher parallelizability and computational efficiency.",
        detailed_summary="In this foundational machine learning paper, Vaswani and colleagues challenge the prevailing paradigm of recurrent neural networks (RNNs and LSTMs) in sequence modeling. The fundamental drawback of recurrent architectures is their sequential nature: computing hidden state h_t strictly requires h_{t-1}, creating an insurmountable parallelization bottleneck for long contexts and limiting batch scaling.\n\nThe Transformer resolves this by dispensing with recurrence and convolutions. Instead, it relies on multi-head attention mechanisms that project Queries, Keys, and Values into multiple lower-dimensional subspaces, allowing the model to simultaneously attend to syntax, semantics, and distant coreference links. The architecture combines an encoder-decoder stack, residual connections, layer normalization, and sinusoidal positional encodings to inject token ordering information. Empirical evaluations demonstrated state-of-the-art translation BLEU scores with order-of-magnitude lower training costs, laying the foundation for modern Large Language Models.",
        is_ai_generated=True,
        model_name="gemini-3.8-flash",
        created_at=five_days_ago,
        updated_at=five_days_ago
    ))

    db.add(PersonalNote(
        reading_id=reading_1.id,
        user_notes="Key realization: Self-attention calculates pairwise relationships between every token, which has O(n^2) complexity in sequence length but runs in O(1) sequential operations! This is why it parallelizes so well on GPUs compared to RNNs.",
        key_concepts=json.dumps(["Self-Attention", "Multi-Head Attention", "Positional Encoding", "Parallelization Bottleneck", "Encoder-Decoder Stack"]),
        updated_at=five_days_ago
    ))

    cards_data_1 = [
        ("The Recurrence Bottleneck", "Traditional RNNs and LSTMs compute sequentially step-by-step, making it impossible to parallelize training across token positions.", "finding"),
        ("Multi-Head Attention", "Splits queries, keys, and values into parallel subspaces so the model can attend to different aspects of information simultaneously.", "concept"),
        ("Positional Encodings", "Because self-attention contains no recurrence or convolutions, sinusoids or embeddings must be added to provide token order.", "concept"),
        ("Scaled Dot-Product Formula", "Attention(Q,K,V) = softmax(QK^T / sqrt(d_k)) * V. The scaling factor prevents gradients from vanishing in large dimensions.", "idea"),
        ("Constant Interaction Distance", "Self-attention connects any two tokens in a single operation, eliminating the vanishing gradient problem over long sentences.", "idea")
    ]
    for title, exp, ctype in cards_data_1:
        db.add(IdeaCard(reading_id=reading_1.id, title=title, explanation=exp, card_type=ctype, is_favorite=True))

    flashcards_1 = [
        ("What is the primary architectural difference between RNNs and Transformers?", "Transformers completely eliminate recurrence and convolutions, relying solely on attention mechanisms.", 4),
        ("Why does scaled dot-product attention divide by the square root of d_k?", "To prevent the dot products from growing excessively large in high dimensions, which would push softmax into regions with extremely small gradients.", 5),
        ("How does a Transformer know the sequential order of words without recurrence?", "Through Positional Encodings added to the input embeddings.", 5),
        ("What is the computational complexity of self-attention per layer with respect to sequence length n?", "O(n^2) computational complexity and memory.", 3),
        ("What hardware efficiency gain does the Transformer achieve over LSTMs?", "It enables full parallelization across all tokens during training, drastically reducing training time.", 4)
    ]
    for q, a, conf in flashcards_1:
        db.add(Flashcard(reading_id=reading_1.id, question=q, answer=a, confidence_rating=conf, review_count=2, last_reviewed_at=two_days_ago))

    disc_1 = [
        ("How does removing recurrence alter how neural networks represent temporality and grammatical structure?", "discussion"),
        ("Is quadratic self-attention memory overhead acceptable for million-token contexts?", "discussion"),
        ("Why is multi-head attention more expressive than a single large attention head?", "discussion"),
        ("Could a Transformer architecture work without positional encodings for unordered sets?", "discussion"),
        ("How does the Transformer's parallel training ability explain the scaling laws of modern LLMs?", "discussion"),
        ("How would you adapt the Transformer encoder for non-text tabular financial data?", "application"),
        ("Design an attention visualization tool to debug whether a model learned subject-verb agreement.", "application"),
        ("How would you apply Transformer self-attention to process protein amino acid sequences for fold prediction?", "application")
    ]
    for q, qtype in disc_1:
        db.add(DiscussionQuestion(reading_id=reading_1.id, question=q, question_type=qtype, user_answer=""))

    # Initial test (completed)
    test_1 = RecallTest(
        reading_id=reading_1.id,
        title="Initial Recall Quiz: Attention Mechanism & Parallelization",
        test_type="initial",
        scheduled_for=five_days_ago,
        completed_at=five_days_ago,
        status="completed",
        overall_score=88.0,
        created_at=five_days_ago
    )
    db.add(test_1)
    db.flush()

    db.add(RecallTestItem(
        test_id=test_1.id,
        question="Explain why recurrent neural networks cannot efficiently parallelize training across sequence tokens.",
        reference_answer="RNNs compute each hidden state sequentially based on the preceding state (h_t depends on h_{t-1}), creating a serial data dependency that prevents parallel execution across token positions.",
        user_response="Recurrent networks have to calculate one step after another because each word requires the hidden state from the previous word. Because of this chain dependency, GPUs cannot process all words in parallel.",
        score=92.0,
        feedback="Superb explanation! You accurately articulated the serial state dependency and GPU hardware bottleneck.",
        correct_concepts=json.dumps(["sequential state dependency", "h_t relies on h_{t-1}", "GPU parallelization failure"]),
        missing_concepts=json.dumps(["batch scaling memory constraint"])
    ))

    # Seven-day follow up test (due in 2 days!)
    test_1_7d = RecallTest(
        reading_id=reading_1.id,
        title="7-Day Spaced Recall Test: Transformer Core Mechanics",
        test_type="seven_day",
        scheduled_for=five_days_ago + timedelta(days=7),  # Due in 2 days from now!
        completed_at=None,
        status="pending",
        overall_score=None,
        created_at=five_days_ago
    )
    db.add(test_1_7d)
    db.flush()

    db.add(RecallTestItem(
        test_id=test_1_7d.id,
        question="Describe the mathematical formula for Scaled Dot-Product Attention and the purpose of the scaling factor.",
        reference_answer="Attention(Q,K,V) = softmax((Q K^T) / sqrt(d_k)) V. The scaling factor sqrt(d_k) counteracts the growth of dot product magnitude in higher dimensions, preventing vanishing softmax gradients.",
        user_response=None,
        score=None
    ))

    # Verification Record for Reading 1
    db.add(VerificationRecord(
        reading_id=reading_1.id,
        claim_text="The Transformer achieved state of the art after training for only 12 hours on eight P100 GPUs.",
        source_excerpt="The Transformer allows for significantly more parallelization and can reach a new state of the art in translation quality after being trained for as little as twelve hours on eight P100 GPUs.",
        external_url="https://arxiv.org/abs/1706.03762",
        status="supported",
        correction="",
        notes="Verified directly against paragraph 4 of Section 1 Introduction.",
        verified_at=five_days_ago
    ))

    # 2. Reading: Spaced Repetition & Cognitive Psychology
    text_2 = """The forgetting curve hypothesizes the decline of memory retention over time. This curve shows how information is lost over time when there is no attempt to retain it. A related concept is the strength of memory that refers to the time of memory traces in the brain. The stronger the memory, the longer period of time that a person is able to recall it. A typical graph of the forgetting curve purports to show that humans tend to halve their memory of newly learned knowledge in a matter of days or weeks unless they consciously review the learned material.

Hermann Ebbinghaus was among the first to pioneer an empirical approach to studying memory. Ebbinghaus noted that reviewing material at spaced intervals dramatically flattens the forgetting curve. Each subsequent review extends the interval before the next review is required. Henry Roediger and Jeffrey Karpicke expanded on this through the 'testing effect' (or retrieval practice effect), demonstrating that active recall through testing produces vastly superior long-term retention compared to passive rereading.

When learners practice active recall, the cognitive effort of retrieving information reconstructs neural retrieval pathways. Spaced retrieval practice capitalizes on the spacing effect: distributed study sessions spaced over days produce stronger, more accessible memories than massed practice (cramming), even when total study time is held equal."""

    reading_2 = Reading(
        title="Spaced Repetition and Retrieval Practice in Cognitive Science",
        author="Hermann Ebbinghaus & Henry L. Roediger III",
        source_url="https://www.nature.com/articles/nrn2190",
        topic="Cognitive Science",
        reading_date="2026-10-09",
        status="completed",
        completion_date="2026-10-09",
        content=text_2,
        word_count=len(text_2.split()),
        char_count=len(text_2),
        created_at=now - timedelta(days=7),
        updated_at=now - timedelta(days=7)
    )
    db.add(reading_2)
    db.flush()

    db.add(Summary(
        reading_id=reading_2.id,
        quick_summary="The forgetting curve illustrates rapid memory decay without review. Spaced repetition and active retrieval practice reconstruct neural pathways, flattening the curve and producing substantially stronger long-term retention than passive rereading or cramming.",
        standard_summary="Pioneered by Hermann Ebbinghaus and expanded by modern cognitive scientists Roediger and Karpicke, memory retention research reveals that humans rapidly lose up to 50% of new information within days. Spaced repetition counters this by scheduling reviews at strategically widening intervals, progressively flattening the forgetting curve. Furthermore, active recall (testing oneself without notes) forces the brain to rebuild neural retrieval pathways. Empirical evidence confirms that distributed retrieval practice yields vastly superior long-term retention compared to massed study or passive rereading, even when total study hours are identical.",
        detailed_summary="This paper examines the cognitive mechanisms underlying human memory consolidation and forgetting. Hermann Ebbinghaus's seminal experiments established the quantitative forgetting curve, illustrating that retention degrades exponentially following initial encoding if no reinforcement occurs. Memory strength dictates the decay rate: stronger traces persist significantly longer.\n\nCrucially, cognitive science identifies two powerful interventions: the Spacing Effect and the Testing Effect. The spacing effect demonstrates that distributed review sessions over days or weeks systematically flatten the retention curve, with each successful retrieval extending the required duration to the next review. The testing effect, rigorously documented by Roediger and Karpicke, proves that active retrieval practice (self-testing without looking at notes) produces robust, flexible neural pathways. Passive rereading creates an illusion of competence without embedding retrieval cues. Consequently, structured spaced retrieval represents the optimal cognitive strategy for durable learning.",
        is_ai_generated=True,
        model_name="gemini-3.8-flash",
        created_at=now - timedelta(days=7),
        updated_at=now - timedelta(days=7)
    ))

    db.add(PersonalNote(
        reading_id=reading_2.id,
        user_notes="Directly justifies our application's 7-day recall testing feature! Testing without notes causes beneficial cognitive friction that strengthens memory traces far more than rereading summaries.",
        key_concepts=json.dumps(["Ebbinghaus Forgetting Curve", "Testing Effect", "Spaced Retrieval", "Active Recall vs Passive Rereading", "Desirable Difficulty"]),
        updated_at=now - timedelta(days=7)
    ))

    cards_data_2 = [
        ("The Forgetting Curve", "Memory retention drops exponentially after initial exposure, halving within days if unreviewed.", "concept"),
        ("Testing Effect (Retrieval Practice)", "Actively retrieving information from memory without notes produces vastly superior retention compared to passive rereading.", "finding"),
        ("Spacing Effect", "Distributing study sessions over spaced intervals yields stronger recall than cramming for identical total hours.", "finding"),
        ("Illusion of Competence", "Rereading text feels fluent and easy, misleading learners into believing they mastered the material when they haven't.", "idea"),
        ("Flattening the Curve", "Each successive spaced review slows the rate of decay, extending the time before memory degrades.", "concept")
    ]
    for title, exp, ctype in cards_data_2:
        db.add(IdeaCard(reading_id=reading_2.id, title=title, explanation=exp, card_type=ctype, is_favorite=True))

    flashcards_2 = [
        ("What does the Ebbinghaus forgetting curve show?", "The exponential decline of memory retention over time when no conscious effort is made to review the material.", 5),
        ("What is the Testing Effect?", "The finding that actively retrieving information from memory via testing produces much greater long-term retention than passive study.", 5),
        ("Why does passive rereading mislead students?", "It creates familiarity and fluency that gives a false illusion of competence without building retrieval pathways.", 4),
        ("What happens to the forgetting curve after each spaced review?", "The curve flattens, meaning the decay rate slows down and memory persists for a longer duration.", 4)
    ]
    for q, a, conf in flashcards_2:
        db.add(Flashcard(reading_id=reading_2.id, question=q, answer=a, confidence_rating=conf, review_count=3, last_reviewed_at=now - timedelta(days=1)))

    disc_2 = [
        ("Why do students persistently prefer passive rereading despite decades of evidence favoring active recall?", "discussion"),
        ("How does cognitive friction or 'desirable difficulty' enhance synaptic consolidation?", "discussion"),
        ("How should spaced intervals be adjusted for complex conceptual topics versus rote factual terms?", "discussion"),
        ("Can excessive testing cause anxiety that interferes with the testing effect?", "discussion"),
        ("How can AI study assistants facilitate active recall without providing tempting crutches?", "discussion"),
        ("Design an optimal 30-day spaced repetition schedule for a medical student studying pharmacology.", "application"),
        ("How would you redesign a college lecture curriculum to incorporate weekly active recall tests?", "application"),
        ("Develop an algorithm that calculates individual forgetting rates based on flashcard confidence ratings.", "application")
    ]
    for q, qtype in disc_2:
        db.add(DiscussionQuestion(reading_id=reading_2.id, question=q, question_type=qtype, user_answer=""))

    # Initial test (completed 7 days ago)
    test_2_init = RecallTest(
        reading_id=reading_2.id,
        title="Initial Recall Test: Forgetting Curve Dynamics",
        test_type="initial",
        scheduled_for=now - timedelta(days=7),
        completed_at=now - timedelta(days=7),
        status="completed",
        overall_score=90.0,
        created_at=now - timedelta(days=7)
    )
    db.add(test_2_init)
    db.flush()

    db.add(RecallTestItem(
        test_id=test_2_init.id,
        question="Contrast the cognitive outcomes of active recall versus passive rereading.",
        reference_answer="Active recall forces the brain to retrieve information from memory, strengthening neural retrieval pathways and exposing gaps in knowledge. Passive rereading creates familiarity and an illusion of competence without establishing durable retrieval cues.",
        user_response="Active recall requires searching your own memory to produce the answer, which rebuilds neural connections. Passive rereading just makes the words look familiar so you think you know it when you actually cannot recall it independently.",
        score=90.0,
        feedback="Clear distinction and accurate explanation of the illusion of competence.",
        correct_concepts=json.dumps(["rebuilding neural connections", "active memory retrieval", "familiarity illusion"]),
        missing_concepts=json.dumps(["retrieval cues"])
    ))

    # Seven-day test: Scheduled exactly 7 days after initial test -> DUE RIGHT NOW!
    test_2_7d = RecallTest(
        reading_id=reading_2.id,
        title="7-Day Follow-Up Recall: Testing Effect Durability",
        test_type="seven_day",
        scheduled_for=now - timedelta(hours=2),  # Past due / DUE TODAY!
        completed_at=None,
        status="pending",
        overall_score=None,
        created_at=now - timedelta(days=7)
    )
    db.add(test_2_7d)
    db.flush()

    db.add(RecallTestItem(
        test_id=test_2_7d.id,
        question="How does spaced practice alter the rate of memory decay compared to massed cramming?",
        reference_answer="Spaced practice distributes reviews over intervals, systematically flattening the forgetting curve and expanding the retention interval, whereas massed cramming results in steep, rapid decay immediately after the exam.",
        user_response=None,
        score=None
    ))

    # 3. Reading: Critical Reading and Epistemic Vigilance
    text_3 = """Epistemic vigilance refers to the suite of cognitive mechanisms that humans employ to evaluate the reliability of communicated information and protect themselves from misinformation. In an era dominated by generative artificial intelligence and algorithmic synthesis, epistemic vigilance must transition from an intuitive interpersonal filter to a deliberate, methodical critical reading practice.

When readers engage with AI-generated summaries, cognitive offloading often induces epistemic complacency. Because large language models produce grammatically flawless, authoritative-sounding text, human readers reflexively suspend disbelief, accepting fluent prose as factual truth. This phenomenon—the fluency heuristic—masks potential hallucinations, omissions, and nuanced distortions.

To practice effective critical reading alongside AI tools, students must master source-grounded cross-verification. This protocol requires actively decomposing AI assertions into testable claims, locating direct empirical evidence in primary sources, categorizing discrepancies into factual contradictions or unsupported extrapolations, and synthesizing independent conclusions."""

    reading_3 = Reading(
        title="Critical Reading and Epistemic Vigilance in the Age of AI",
        author="Dan Sperber & Gloria Origgi",
        source_url="https://doi.org/10.1111/mila.12001",
        topic="Education & Epistemology",
        reading_date="2026-10-12",
        status="completed",
        completion_date="2026-10-12",
        content=text_3,
        word_count=len(text_3.split()),
        char_count=len(text_3),
        created_at=now - timedelta(days=4),
        updated_at=now - timedelta(days=4)
    )
    db.add(reading_3)
    db.flush()

    db.add(Summary(
        reading_id=reading_3.id,
        quick_summary="Epistemic vigilance describes how learners evaluate information credibility. In AI-assisted study, fluent language generates an illusion of truth, requiring structured source-grounded verification to detect hallucinations and prevent intellectual complacency.",
        standard_summary="Sperber and Origgi's framework of epistemic vigilance highlights the cognitive defenses humans use to screen communicated claims. With generative AI entering education, students face unprecedented risks of epistemic complacency. Because language models output polished, authoritative syntax, learners succumb to the fluency heuristic—confusing linguistic fluency with factual accuracy. To counteract this vulnerability, students must replace passive consumption with methodical critical reading: systematically decomposing AI summaries into distinct claims, cross-referencing them against primary source texts, and documenting unsupported or contradicted assertions.",
        detailed_summary="This paper investigates how digital cognitive tools alter epistemic scrutiny during academic study. Sperber and colleagues conceptualize epistemic vigilance as an evolutionary defense mechanism designed to evaluate source credibility, contextual plausibility, and logical coherence. In traditional environments, interpersonal social cues assist in verifying truthfulness. However, interacting with large language models creates a dangerous epistemic rupture.\n\nAI systems generate prose characterized by high linguistic fluency, grammatical precision, and an authoritative tone. Human cognition relies on the fluency heuristic, intuitively associating effortless readability with veracity. Consequently, students offload critical evaluation, failing to notice subtle hallucinations, fabricated nuances, or biased omissions. The authors argue that educational frameworks must explicitly teach source-grounded cross-verification. Learners must treat AI outputs as unvetted hypotheses rather than established facts, systematically verifying claims against primary literature.",
        is_ai_generated=True,
        model_name="gemini-3.8-flash",
        created_at=now - timedelta(days=4),
        updated_at=now - timedelta(days=4)
    ))

    db.add(PersonalNote(
        reading_id=reading_3.id,
        user_notes="Directly informs our 'Verification Lab' feature. We must make it seamless to highlight any claim in an AI summary and verify it directly against the source text.",
        key_concepts=json.dumps(["Epistemic Vigilance", "Fluency Heuristic", "Cognitive Offloading", "Epistemic Complacency", "Source-Grounded Cross-Verification"]),
        updated_at=now - timedelta(days=4)
    ))

    cards_data_3 = [
        ("The Fluency Heuristic", "People mistakenly equate smooth, grammatical writing with factual accuracy and truthfulness.", "concept"),
        ("Cognitive Offloading", "Outsourcing memory and critical evaluation to digital tools, which can degrade personal analytical judgment.", "idea"),
        ("Epistemic Complacency", "The passive acceptance of AI summaries without checking original evidence or questioning underlying assumptions.", "finding"),
        ("Source-Grounded Verification", "The disciplined practice of confirming every AI-generated claim against primary source citations before citing it.", "concept")
    ]
    for title, exp, ctype in cards_data_3:
        db.add(IdeaCard(reading_id=reading_3.id, title=title, explanation=exp, card_type=ctype, is_favorite=False))

    flashcards_3 = [
        ("What is epistemic vigilance?", "The cognitive ability and disposition to evaluate the credibility of information and protect oneself from misinformation.", 4),
        ("Why does the fluency heuristic make AI summaries deceptively dangerous?", "Because AI outputs fluent, polished sentences that our brains subconsciously accept as true, masking hallucinations.", 4),
        ("What is cognitive offloading in reading?", "Relying on AI summaries rather than reading and synthesizing the original text oneself.", 3)
    ]
    for q, a, conf in flashcards_3:
        db.add(Flashcard(reading_id=reading_3.id, question=q, answer=a, confidence_rating=conf, review_count=1, last_reviewed_at=now - timedelta(days=1)))

    disc_3 = [
        ("How does the fluency heuristic distort student peer review and grading?", "discussion"),
        ("At what point does AI summarization cease being an aid and become harmful cognitive offloading?", "discussion"),
        ("How should universities assess writing when AI can produce fluent essays instantly?", "discussion"),
        ("Can epistemic vigilance be automated by another AI model, or must a human remain in the loop?", "discussion"),
        ("What cognitive exercises best develop epistemic vigilance in undergraduate researchers?", "discussion"),
        ("Draft a checklist for an academic journal reviewer to verify AI-assisted literature surveys.", "application"),
        ("Design a browser extension that flags ungrounded claims in real time while reading online articles.", "application"),
        ("Create a rubric for grading student critical reading journals that use AI summaries.", "application")
    ]
    for q, qtype in disc_3:
        db.add(DiscussionQuestion(reading_id=reading_3.id, question=q, question_type=qtype, user_answer=""))

    # Verification Record for Reading 3
    db.add(VerificationRecord(
        reading_id=reading_3.id,
        claim_text="Large language models possess conscious awareness of when their generated statements are factually incorrect.",
        source_excerpt="Because large language models produce grammatically flawless, authoritative-sounding text, human readers reflexively suspend disbelief, accepting fluent prose as factual truth.",
        external_url=None,
        status="contradicted",
        correction="Language models generate token probabilities based on text patterns and do not possess conscious awareness or self-reflective belief states.",
        notes="Identified as a contradicted statement commonly misattributed to AI systems.",
        verified_at=now - timedelta(days=2)
    ))

    # 4. Reading: Ethical Governance of AI in Academia
    text_4 = """The rapid integration of generative artificial intelligence into academic scholarship presents profound ethical, legal, and educational dilemmas. Key among these are intellectual property infringement, attribution ethics, algorithmic bias, privacy vulnerabilities, and the erosion of independent critical reasoning.

Academic honesty requires unambiguous transparency. When scholars utilize foundation models for literature extraction, summarization, or coding, ethical guidelines dictate explicit disclosure of the tools used, the exact prompting methodologies, and the scope of AI intervention. Failure to disclose AI assistance misrepresents human provenance and undermines scientific peer review.

Furthermore, copyright law protects authorial expressions. Uploading proprietary textbooks or paywalled publications into commercial third-party cloud APIs may violate contractual terms of service or copyright protections. Responsible academic institutions must implement local or privacy-preserving architectures, enforce data minimization, and guarantee that AI tools complement rather than replace genuine student intellectual labor."""

    reading_4 = Reading(
        title="Ethical Governance and Academic Integrity in Generative AI",
        author="Miles Brundage, Joanna Bryson & Kate Crawford",
        source_url="https://doi.org/10.1145/3351095.3372862",
        topic="Ethics & Policy",
        reading_date="2026-10-14",
        status="reading",
        completion_date=None,
        content=text_4,
        word_count=len(text_4.split()),
        char_count=len(text_4),
        created_at=now - timedelta(days=2),
        updated_at=now - timedelta(days=2)
    )
    db.add(reading_4)
    db.flush()

    db.add(Summary(
        reading_id=reading_4.id,
        quick_summary="The adoption of generative AI in academia demands transparent attribution, privacy protection, and respect for copyright. Institutions must ensure AI acts as an augmentative aid without compromising intellectual honesty or student critical reasoning.",
        standard_summary="Brundage, Bryson, and Crawford address the critical ethical dimensions of AI in education and scholarship. They argue that academic integrity requires honest and explicit disclosure whenever AI tools assist in literature reviews or analysis. Intellectual property and data privacy are paramount concerns: uploading copyrighted papers or private student records to third-party APIs can violate copyright laws and privacy rights. The authors propose ethical governance frameworks emphasizing clear provenance, secure API key handling, and safeguarding human critical thinking against passive dependency.",
        detailed_summary="This policy paper explores the multifaceted ethical challenges generated by foundation models in academic research. First, the authors dissect the question of authorship and provenance: AI systems cannot be held legally or morally accountable, meaning all scholarly responsibility rests with human authors who must transparently document model usage.\n\nSecond, the paper evaluates copyright and fair use. Ingesting paywalled or proprietary texts into commercial LLM APIs risks copyright infringement and breaches institutional data confidentiality. Third, the authors address cognitive dependence: when students replace deep reading with superficial summaries, their capacity for nuanced synthesis atrophies. To build responsible AI ecosystems, universities must mandate transparent AI disclosures, adopt privacy-conscious API protocols, and reinforce active learning practices.",
        is_ai_generated=True,
        model_name="gemini-3.8-flash",
        created_at=now - timedelta(days=2),
        updated_at=now - timedelta(days=2)
    ))

    db.add(PersonalNote(
        reading_id=reading_4.id,
        user_notes="Directly aligns with our application's 'AI Tools and Ethics' requirement. We must emphasize data privacy, local SQLite persistence, honest AI disclosures, and avoiding copyright violations.",
        key_concepts=json.dumps(["Academic Provenance", "Disclosure Standards", "Copyright & Fair Use", "Data Minimization", "Cognitive Atrophy Prevention"]),
        updated_at=now - timedelta(days=2)
    ))

    cards_data_4 = [
        ("Transparency and Disclosure", "Academic honesty requires explicitly declaring which AI tools were used and the exact tasks they performed.", "concept"),
        ("Copyright and API Ingestion", "Uploading full paywalled books to third-party cloud servers may violate copyright licenses and user agreements.", "finding"),
        ("Non-Authorship of AI", "AI models cannot be co-authors because they cannot assume legal or ethical accountability for their claims.", "idea")
    ]
    for title, exp, ctype in cards_data_4:
        db.add(IdeaCard(reading_id=reading_4.id, title=title, explanation=exp, card_type=ctype, is_favorite=False))

    flashcards_4 = [
        ("Why can an AI model not be credited as an academic author?", "Because AI lacks legal personhood, moral agency, and the capacity to take responsibility for scholarly claims.", 5),
        ("What privacy risk arises from uploading student papers to public AI chatbots?", "The content may be stored, analyzed, or incorporated into future training sets by third-party commercial providers.", 4)
    ]
    for q, a, conf in flashcards_4:
        db.add(Flashcard(reading_id=reading_4.id, question=q, answer=a, confidence_rating=conf, review_count=1, last_reviewed_at=now - timedelta(hours=12)))

    disc_4 = [
        ("Should academic papers have a standardized 'AI Contribution Disclosure' section?", "discussion"),
        ("How do paywalls perpetuate educational inequality in the era of AI summarization?", "discussion"),
        ("Where is the boundary between grammar enhancement and ghostwriting?", "discussion"),
        ("How can students ethically verify that an AI summary hasn't hallucinated citations?", "discussion"),
        ("What privacy safeguards should universities require before adopting AI learning platforms?", "discussion"),
        ("Draft a departmental AI usage policy for undergraduate thesis researchers.", "application"),
        ("Create an API key management audit plan to ensure student API tokens are never exposed in public code.", "application"),
        ("Develop an ethical disclosure template for students submitting assignments supported by AI.", "application")
    ]
    for q, qtype in disc_4:
        db.add(DiscussionQuestion(reading_id=reading_4.id, question=q, question_type=qtype, user_answer=""))

    # 5. Reading: Deep Work and Information Retention
    text_5 = """Deep work is the ability to focus without distraction on a cognitively demanding task. It is a skill that allows you to quickly master complicated information and produce better results in less time. Deep work will make you better at what you do and provide the sense of true fulfillment that comes from craftsmanship. In short, deep work is like a super power in our increasingly competitive twenty-first-century economy.

In contrast, shallow work consists of noncognitively demanding, logistical-style tasks, often performed while distracted. These efforts tend not to create much new value in the world and are easy to replicate. The ubiquity of network tools—email, social media, messaging apps, and rapid automated feeds—fragments attention through continuous context switching. 

Attention residue, a concept pioneered by Sophie Leroy, explains why multitasking impairs deep reading. When you switch from Task A to Task B, your attention does not immediately follow. A residue of your attention remains stuck thinking about the previous task. Even quick checks of email or notifications leave significant attention residue, degrading cognitive capacity for deep reading, synthesis, and long-term memory formation."""

    reading_5 = Reading(
        title="Deep Work: Focus, Attention Residue, and Deep Reading",
        author="Cal Newport",
        source_url="https://calnewport.com/books/deep-work/",
        topic="Productivity & Psychology",
        reading_date="2026-10-15",
        status="completed",
        completion_date="2026-10-15",
        content=text_5,
        word_count=len(text_5.split()),
        char_count=len(text_5),
        created_at=now - timedelta(days=1),
        updated_at=now - timedelta(days=1)
    )
    db.add(reading_5)
    db.flush()

    db.add(Summary(
        reading_id=reading_5.id,
        quick_summary="Deep work entails distraction-free immersion in cognitively demanding tasks. Frequent task-switching causes attention residue, which fragments concentration and severely impedes deep reading and long-term memory consolidation.",
        standard_summary="Computer science professor Cal Newport defines deep work as high-focus cognitive effort that generates significant intellectual value. He contrasts this with shallow work—fragmented, low-intensity tasks that are easily replicated. A core scientific justification for deep work is Sophie Leroy's research on 'attention residue': whenever an individual switches tasks or glances at notifications, attentional bandwidth remains trapped on the prior task. This cognitive fragmentation undermines comprehension of complex academic texts and impedes the neural consolidation required for long-term memory retention.",
        detailed_summary="In this influential analysis of modern intellectual labor, Newport argues that the capacity for uninterrupted concentration is becoming increasingly rare and valuable. He delineates two contrasting work modalities: Deep Work (prolonged focus on cognitively demanding challenges) and Shallow Work (distracted, logistical tasks with low intellectual yield).\n\nCentral to Newport's framework is Sophie Leroy's empirical discovery of 'attention residue.' When a reader interrupts their study session to glance at a message or feed, cognitive attention does not cleanly transition. Instead, a residue remains dedicated to the interrupted task, reducing executive cognitive bandwidth by 20% to 40%. In academic reading, this residue prevents deep semantic processing and reflective synthesis. For students utilizing AI tools, the danger lies in rapid scanning and constant tool-switching, which induces shallow engagement rather than the sustained reflection necessary for intellectual mastery.",
        is_ai_generated=True,
        model_name="gemini-3.8-flash",
        created_at=now - timedelta(days=1),
        updated_at=now - timedelta(days=1)
    ))

    db.add(PersonalNote(
        reading_id=reading_5.id,
        user_notes="Highlights why our UI must be clean, distraction-free, and support focused two-column side-by-side reading without cluttered popups or ad feeds.",
        key_concepts=json.dumps(["Deep Work vs Shallow Work", "Attention Residue", "Context Switching Cost", "Monastic/Bimodal Focus", "Craftsmanship in Learning"]),
        updated_at=now - timedelta(days=1)
    ))

    cards_data_5 = [
        ("Attention Residue", "When switching between tasks, a portion of mental capacity remains stuck on the prior task, degrading focus.", "finding"),
        ("Deep Work Hypothesis", "The skill to concentrate without distraction on difficult tasks is becoming rare just as its economic value is soaring.", "concept"),
        ("Shallow Work Trap", "Low-effort, rapid administrative or skimming tasks produce an illusion of productivity while creating little durable knowledge.", "idea")
    ]
    for title, exp, ctype in cards_data_5:
        db.add(IdeaCard(reading_id=reading_5.id, title=title, explanation=exp, card_type=ctype, is_favorite=True))

    flashcards_5 = [
        ("What is attention residue?", "The cognitive phenomenon where part of your attention remains focused on a previous task after switching to a new one.", 5),
        ("Why does rapid context-switching harm academic reading?", "It leaves attention residue that diminishes working memory capacity and impairs semantic encoding.", 4)
    ]
    for q, a, conf in flashcards_5:
        db.add(Flashcard(reading_id=reading_5.id, question=q, answer=a, confidence_rating=conf, review_count=2, last_reviewed_at=now))

    disc_5 = [
        ("How do AI summaries either support or undermine deep reading habits?", "discussion"),
        ("What environment modifications produce the greatest reduction in attention residue?", "discussion"),
        ("Is rapid multitasking an adaptive modern skill or an inherent cognitive deficiency?", "discussion"),
        ("How can digital reading interfaces be architected to discourage shallow skimming?", "discussion"),
        ("What metrics reliably differentiate genuine deep work from prolonged shallow work?", "discussion"),
        ("Design a 2-hour daily deep study ritual incorporating 45-minute focus sprints and active recall.", "application"),
        ("Develop an attention residue self-audit log to identify the most distracting digital interruptions during study.", "application"),
        ("Create a browser reading mode that blocks all tab switching during active reading sessions.", "application")
    ]
    for q, qtype in disc_5:
        db.add(DiscussionQuestion(reading_id=reading_5.id, question=q, question_type=qtype, user_answer=""))

    # Initial test (completed yesterday)
    test_5 = RecallTest(
        reading_id=reading_5.id,
        title="Initial Recall Test: Deep Work & Attention Residue",
        test_type="initial",
        scheduled_for=now - timedelta(days=1),
        completed_at=now - timedelta(days=1),
        status="completed",
        overall_score=94.0,
        created_at=now - timedelta(days=1)
    )
    db.add(test_5)
    db.flush()

    db.add(RecallTestItem(
        test_id=test_5.id,
        question="Define attention residue and explain its physiological impact on reading comprehension.",
        reference_answer="Attention residue occurs when shifting focus from one task to another leaves cognitive resources tied up thinking about the previous task. This impairs executive function and reduces working memory available for deep reading.",
        user_response="Attention residue means your brain doesn't instantly switch when you check your phone or switch tabs. A part of your attention stays stuck on the previous task, which lowers your working memory and ruins comprehension of hard texts.",
        score=94.0,
        feedback="Exceptional understanding and concise real-world explanation of working memory degradation.",
        correct_concepts=json.dumps(["cognitive resources remain tied up", "working memory impairment", "reduced comprehension"]),
        missing_concepts=json.dumps([])
    ))

    # Seven-day test scheduled for +6 days from now
    db.add(RecallTest(
        reading_id=reading_5.id,
        title="7-Day Recall Test: Long-Term Focus Retention",
        test_type="seven_day",
        scheduled_for=now + timedelta(days=6),
        completed_at=None,
        status="pending",
        overall_score=None,
        created_at=now - timedelta(days=1)
    ))

    # Seed Experiment Sessions: Real data comparing Normal vs AI-Assisted Reading
    db.add(ExperimentSession(
        reading_id=reading_1.id,
        method="ai_assisted",
        start_time=five_days_ago - timedelta(minutes=40),
        completion_time=five_days_ago,
        duration_minutes=40.0,
        initial_score=88.0,
        seven_day_score=None,
        confidence_rating=4,
        observations="AI summaries helped quickly build a mental map of multi-head attention before reading technical math sections.",
        created_at=five_days_ago
    ))

    db.add(ExperimentSession(
        reading_id=reading_2.id,
        method="normal",
        start_time=now - timedelta(days=7, minutes=55),
        completion_time=now - timedelta(days=7),
        duration_minutes=55.0,
        initial_score=90.0,
        seven_day_score=72.0,  # Recorded during testing
        confidence_rating=4,
        observations="Normal reading required re-reading the text 3 times to extract the exact distinctions between spacing and testing effects.",
        created_at=now - timedelta(days=7)
    ))

    db.add(ExperimentSession(
        reading_id=reading_3.id,
        method="normal",
        start_time=now - timedelta(days=4, minutes=45),
        completion_time=now - timedelta(days=4),
        duration_minutes=45.0,
        initial_score=78.0,
        seven_day_score=None,
        confidence_rating=3,
        observations="Found some epistemological terms dense without summary assistance; took longer to synthesize conclusions.",
        created_at=now - timedelta(days=4)
    ))

    db.add(ExperimentSession(
        reading_id=reading_5.id,
        method="ai_assisted",
        start_time=now - timedelta(days=1, minutes=25),
        completion_time=now - timedelta(days=1),
        duration_minutes=25.0,
        initial_score=94.0,
        seven_day_score=None,
        confidence_rating=5,
        observations="Using flashcards immediately after reading reinforced attention residue terminology very effectively.",
        created_at=now - timedelta(days=1)
    ))

    # Seed Prompt Templates & Versions
    p1 = PromptTemplate(
        title="Three-Level Executive Academic Summary",
        category="summary",
        description="Generates Quick (50w), Standard (150w), and Detailed (300w) summaries with conceptual clarity."
    )
    db.add(p1)
    db.flush()

    pv1_1 = PromptVersion(
        prompt_id=p1.id,
        version_number=1,
        template_text="Summarize this text in 50 words, 150 words, and 300 words:\n\n{{text}}",
        system_instruction="You are a helpful study assistant.",
        created_at=five_days_ago
    )
    pv1_2 = PromptVersion(
        prompt_id=p1.id,
        version_number=2,
        template_text="""Analyze the following academic reading:
Source Text:
{{text}}

Generate three distinct levels of summaries:
1. Quick Summary (~50 words): Main thesis and primary takeaway.
2. Standard Summary (~150 words): Problem, method/rationale, core findings, significance.
3. Detailed Summary (~300 words): Key concepts, technical terms explained simply, caveats and implications.

Preserve factual accuracy and do not hallucinate claims.""",
        system_instruction="You are an expert academic tutor and epistemologist.",
        created_at=two_days_ago
    )
    db.add_all([pv1_1, pv1_2])
    db.flush()

    db.add(PromptTestRun(
        prompt_version_id=pv1_2.id,
        reading_id=reading_1.id,
        output_text="Generated superior structured breakdown with clear word-count boundaries and exact technical terms.",
        clarity_rating=5,
        accuracy_rating=5,
        completeness_rating=5,
        usefulness_rating=5,
        notes="Version 2 is significantly better because the explicit section breakdown guides model output structure.",
        created_at=two_days_ago
    ))

    p2 = PromptTemplate(
        title="Active Recall & Flashcard Generator",
        category="flashcards",
        description="Creates conceptual Q&A flashcards and application questions from reading text."
    )
    db.add(p2)
    db.flush()

    pv2_1 = PromptVersion(
        prompt_id=p2.id,
        version_number=1,
        template_text="Generate 5 flashcards from this text:\n{{text}}",
        system_instruction="Create educational flashcards.",
        created_at=four_days_ago
    )
    db.add(pv2_1)

    p3 = PromptTemplate(
        title="Socratic Epistemic Fact-Checker",
        category="verification",
        description="Examines a claim against a text to identify factual support, contradictions, and omissions."
    )
    db.add(p3)
    db.flush()

    pv3_1 = PromptVersion(
        prompt_id=p3.id,
        version_number=1,
        template_text="""Check this claim against the provided source text:
Claim: {{input}}
Text: {{text}}

Determine if the claim is supported, contradicted, or unsupported. Quote the exact excerpt.""",
        system_instruction="You are a strict academic fact-checker. Never assume facts not in the text.",
        created_at=three_days_ago
    )
    db.add(pv3_1)

    # Seed Reflections
    db.add(Reflection(
        reading_id=reading_1.id,
        date="2026-10-11",
        did_ai_help="Yes, reading the 50-word quick summary first provided a mental scaffold that made the mathematical equations in the paper much less intimidating.",
        remember_without_notes="I remembered the main idea that self-attention removes sequential dependency, but I struggled to recall the exact mathematical notation for the scaling factor sqrt(d_k).",
        deep_thinking_vs_dependence="I noticed a slight tendency to rely on the summary rather than working through the proof. In future readings, I will read the original text first before viewing the AI notes.",
        misunderstood_concepts="I initially assumed multi-head attention increased computational cost linearly, but in reality d_k is reduced so total computation remains similar to a single full-rank head.",
        future_changes="I will write my personal notes in my own words before opening the flashcards.",
        general_notes="The experiment showed that AI assistance saved 15 minutes of reading time, but active testing is still what cemented the memory.",
        ai_suggestions="Consider testing yourself on the encoder vs decoder self-attention differences during your next study session.",
        created_at=four_days_ago
    ))

    db.add(Reflection(
        reading_id=reading_2.id,
        date="2026-10-13",
        did_ai_help="This was a normal reading session without AI summaries. It took longer (55 min), but I felt a very deep organic grasp of Ebbinghaus's methodology.",
        remember_without_notes="Remembered the core concepts well, which shows normal reading with active note-taking is powerful for foundational understanding.",
        deep_thinking_vs_dependence="No AI dependence in this session. The struggle of summarizing in my own notebook created beneficial cognitive effort.",
        misunderstood_concepts="Understood everything clearly, though needed to check the exact spelling and timeline of Ebbinghaus's work.",
        future_changes="Combine the depth of normal reading with AI-generated flashcards for spaced review.",
        general_notes="Comparing normal vs AI reading makes it clear: AI is best as a testing and scaffolding partner, not an effortless replacement for reading.",
        ai_suggestions="Try a hybrid approach: read 20 minutes unassisted, then use AI to generate 5 challenging edge-case questions.",
        created_at=three_days_ago
    ))

    # Seed AI Tool Logs for 4 Free-Tier Tools
    tools_data = [
        (
            "ChatGPT",
            "Socratic concept explanation and prompt drafting",
            "Explain how the scaled dot-product attention avoids vanishing gradients in high dimensions using an analogy.",
            "Text from Attention Is All You Need Section 3.2",
            "Analogized dot product growth to rolling multiple dice where variance adds up, shifting softmax into saturated low-gradient tails.",
            "Refined explanation to explicitly mention the division by sqrt(d_k) as variance normalization.",
            "Exceptional metaphorical explanations and fast conversational iterations.",
            "Occasionally over-simplifies technical nuances unless prompted with strict mathematical constraints.",
            "Free tier subject to hourly rate limits; conversation history should not contain confidential research data.",
            four_days_ago
        ),
        (
            "Google Gemini",
            "Multi-level academic summarization and source-grounded flashcards",
            "Generate Quick (50w), Standard (150w), and Detailed (300w) summaries of Vaswani et al. 2017.",
            "Full paper abstract and introduction",
            "Delivered structured 3-tier summaries adhering closely to requested word-length parameters.",
            "Adjusted prompt in Prompt Lab to enforce explicit JSON structure for UI integration.",
            "1M token context window allows ingesting long papers without losing earlier sections; official Python SDK integration.",
            "Free API tier has rate limits (RPM/TPD) that require handling 429 errors gracefully.",
            "API keys must be secured in server environment variables and never exposed to client-side code.",
            five_days_ago
        ),
        (
            "Google NotebookLM",
            "Source-grounded research notebook synthesis and audio overview",
            "Upload 3 PDFs on cognitive psychology and ask: What is the empirical evidence contrasting active recall with rereading?",
            "PDFs of Ebbinghaus, Roediger & Karpicke, and Dunlosky et al.",
            "Provided answers with inline citations directly linking back to specific page numbers in the uploaded documents.",
            "Checked citation [1] to confirm the exact retention percentage reported by Roediger (67% vs 40%).",
            "Strictly grounded in uploaded sources, minimizing hallucinations; provides clickable page citations.",
            "Currently a standalone web application without a public REST API; manual copy/paste required for workflow integration.",
            "Notebooks reside on Google Drive; adhere to enterprise data protection terms for institutional accounts.",
            three_days_ago
        ),
        (
            "Notion/Obsidian",
            "Personal persistent knowledge graph and study notes",
            "Create a linked concept page connecting 'Attention Residue' to 'Spaced Repetition' and 'Digital Literacy'.",
            "Key idea cards exported from ReadWise AI workspace",
            "Rendered bidirectional link graph displaying relationships across readings.",
            "Organized tags by academic discipline (#CognitiveScience, #Productivity).",
            "Obsidian provides complete local markdown storage with zero cloud lock-in; Notion provides rich collaborative databases.",
            "Requires manual curation; no native AI verification of notes without paid add-ons.",
            "Obsidian local vaults ensure 100% data privacy and offline access; Notion cloud databases require user authentication.",
            two_days_ago
        )
    ]

    for tool, task, prompt, inp, out, corr, strn, lim, priv, dt in tools_data:
        db.add(AIToolLog(
            tool_name=tool,
            task_performed=task,
            prompt_used=prompt,
            input_data=inp,
            output_received=out,
            corrections=corr,
            strengths_observed=strn,
            limitations_observed=lim,
            privacy_notes=priv,
            created_at=dt
        ))

    db.commit()
    return {"status": "success", "message": "Successfully seeded 5 complete academic readings and study records."}
