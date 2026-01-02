import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Download, Youtube, ArrowRight, ArrowLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const TogariAssessment = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState({
        q1: null,
        q2: null,
        q3: null
    });
    const [worksheetData, setWorksheetData] = useState({
        myTogari: '',
        roleChoice: '',
        actionPlan: ''
    });
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('togariAssessment');
        if (saved) {
            const data = JSON.parse(saved);
            setAnswers(data.answers || answers);
            setWorksheetData(data.worksheetData || worksheetData);
        }
    }, []);

    // Save to localStorage whenever data changes
    useEffect(() => {
        localStorage.setItem('togariAssessment', JSON.stringify({
            answers,
            worksheetData
        }));
    }, [answers, worksheetData]);

    const questions = [
        {
            id: 'q1',
            title: 'チェック1:「正解探しゲーム」型の業務ですか?',
            description: 'あなたの業務の大半は、「会社のルール」や「過去の事例」に従えば答えが出る内容ですか?',
            examples: [
                'カスタマーサポート:「注文はどこ?」への定型回答',
                '契約書レビュー:リスク条項を探す作業',
                '旅行手配:欠航時の代替便を探す'
            ],
            type: 'yesno'
        },
        {
            id: 'q2',
            title: 'チェック2:「テトリス」型の業務ですか?',
            description: 'あなたの業務は、パズルのように「最適解」を見つける作業が中心ですか?',
            examples: [
                'スケジュール調整:全員の空き時間を探す',
                '在庫管理:需要予測に基づく発注',
                'データ入力:フォーマットに従って情報を整理'
            ],
            type: 'yesno'
        },
        {
            id: 'q3',
            title: 'チェック3:「80%の質」で十分な業務ですか?',
            description: 'あなたの業務に、「90点以上の仕上げ」や「独自の美学・こだわり」が求められていますか?',
            examples: [
                '会議の議事録:要点が抑えられていればOK',
                '一次レビュー:人間が最終判断する前段階',
                '定型メール:テンプレートで8割完成'
            ],
            type: 'yesno'
        }
    ];

    const calculateRisk = () => {
        let riskScore = 0;
        if (answers.q1 === 'yes') riskScore++;
        if (answers.q2 === 'yes') riskScore++;
        if (answers.q3 === 'yes') riskScore++;
        return riskScore;
    };

    const getRiskLevel = (score) => {
        if (score === 0) return { level: '低リスク', color: '#4ade80', message: 'あなたの業務には既に「尖」があります。その強みをさらに磨いていきましょう。' };
        if (score === 1) return { level: '中リスク', color: '#CCA806', message: '一部の業務はAIに置き換わる可能性があります。今から「尖」を意識した行動を始めましょう。' };
        if (score === 2) return { level: '高リスク', color: '#f87171', message: '多くの業務がAIに置き換わる可能性が高いです。今すぐ「尖」を作る行動を始める必要があります。' };
        return { level: '最高リスク', color: '#dc2626', message: 'あなたの業務の大半がAIに置き換わる可能性があります。キャリアの再構築が急務です。' };
    };

    const steps = [
        { id: 'intro', title: 'イントロ' },
        { id: 'assessment', title: '尖度セルフチェック' },
        { id: 'results', title: '診断結果' },
        { id: 'worksheet', title: 'ワークシート' },
        { id: 'action', title: '行動計画' }
    ];

    const handleTogariChange = useCallback((e) => {
        setWorksheetData(prev => ({ ...prev, myTogari: e.target.value }));
    }, []);

    const handleRoleChange = useCallback((role) => {
        setWorksheetData(prev => ({ ...prev, roleChoice: role }));
    }, []);

    const handleActionPlanChange = useCallback((e) => {
        setWorksheetData(prev => ({ ...prev, actionPlan: e.target.value }));
    }, []);

    const IntroScreen = () => (
        <div className="flex-col-gap-8">
            <div style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#CCA806' }}>
                    尖(とがり)診断
                </h1>
                <p style={{ fontSize: '1.25rem', color: '#d1d5db', marginBottom: '0.5rem' }}>AI時代を生き抜くためのセルフチェック</p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>by Kuuki Design</p>
            </div>

            <div className="flex-col-gap-4" style={{ color: '#d1d5db' }}>
                <p style={{ fontSize: '1.125rem', lineHeight: '1.75' }}>
                    2026年以降、AIは「チャットボット」から「自律型エージェント」へと進化します。
                </p>
                <p style={{ fontSize: '1.125rem', lineHeight: '1.75' }}>
                    この変化の中で、あなたの仕事は「置き換えられる側」なのか、
                    それとも「AIを指揮する側」なのか。
                </p>
                <p style={{ fontSize: '1.125rem', lineHeight: '1.75' }}>
                    この診断では、あなたの「尖度」をチェックし、
                    これから磨くべきスキルと方向性を見つけ出します。
                </p>
            </div>

            <div style={{
                backgroundColor: '#2a2a2a',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #374151'
            }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#CCA806' }}>
                    この診断でわかること
                </h3>
                <ul className="flex-col-gap-2" style={{ color: '#d1d5db' }}>
                    <li>✓ あなたの業務がAIに置き換えられるリスク度</li>
                    <li>✓ 「舵取り」と「磨き手」、どちらを目指すべきか</li>
                    <li>✓ 3-5年の具体的な行動計画</li>
                </ul>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', paddingTop: '1rem' }}>
                <a
                    href="https://www.youtube.com/channel/UChXxbzzxzUHn7RRlgX0jaIQ"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', textDecoration: 'none' }}
                >
                    <Youtube size={20} />
                    <span style={{ fontSize: '0.875rem' }}>Rioのチャンネルを見る</span>
                </a>
            </div>

            <button
                onClick={() => setCurrentStep(1)}
                style={{
                    width: '100%',
                    padding: '1rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    backgroundColor: '#CCA806',
                    color: '#1d1d1d',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '1rem'
                }}
            >
                <span>診断を始める</span>
                <ArrowRight size={20} />
            </button>
        </div>
    );

    const AssessmentScreen = ({ currentQ, setCurrentQ, answers, setAnswers, questions, onBack, onNext }) => {
        const question = questions[currentQ];

        return (
            <div className="flex-col-gap-8">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#CCA806' }}>尖度セルフチェック</h2>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{currentQ + 1} / {questions.length}</span>
                </div>

                <div className="flex-col-gap-6">
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem', color: '#e5e7eb' }}>{question.title}</h3>
                        <p style={{ color: '#9ca3af', marginBottom: '1rem' }}>{question.description}</p>
                    </div>

                    <div style={{
                        backgroundColor: '#2a2a2a',
                        padding: '1.5rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #374151'
                    }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: '#9ca3af' }}>具体例:</p>
                        <ul className="flex-col-gap-2">
                            {question.examples.map((example, idx) => (
                                <li key={idx} style={{ fontSize: '0.875rem', color: '#d1d5db', display: 'flex', alignItems: 'flex-start' }}>
                                    <span style={{ marginRight: '0.5rem' }}>•</span>
                                    <span>{example}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex-col-gap-4">
                        <button
                            onClick={() => setAnswers({ ...answers, [question.id]: 'yes' })}
                            style={{
                                width: '100%',
                                padding: '1rem 1.5rem',
                                borderRadius: '0.5rem',
                                fontWeight: '600',
                                backgroundColor: answers[question.id] === 'yes' ? '#CCA806' : '#2a2a2a',
                                border: answers[question.id] === 'yes' ? '2px solid #CCA806' : '1px solid #374151',
                                color: answers[question.id] === 'yes' ? '#1d1d1d' : '#e5e7eb',
                                fontSize: '1rem'
                            }}
                        >
                            はい、当てはまります
                        </button>
                        <button
                            onClick={() => setAnswers({ ...answers, [question.id]: 'no' })}
                            style={{
                                width: '100%',
                                padding: '1rem 1.5rem',
                                borderRadius: '0.5rem',
                                fontWeight: '600',
                                backgroundColor: answers[question.id] === 'no' ? 'rgba(204, 168, 6, 0.1)' : '#2a2a2a',
                                border: answers[question.id] === 'no' ? '2px solid #CCA806' : '1px solid #374151',
                                color: '#e5e7eb',
                                fontSize: '1rem'
                            }}
                        >
                            いいえ、当てはまりません
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1.5rem' }}>
                    <button
                        onClick={() => currentQ > 0 ? setCurrentQ(currentQ - 1) : onBack()}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #4b5563',
                            backgroundColor: 'transparent',
                            color: '#e5e7eb',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <ArrowLeft size={20} />
                        <span>戻る</span>
                    </button>
                    {currentQ < questions.length - 1 ? (
                        <button
                            onClick={() => setCurrentQ(currentQ + 1)}
                            disabled={!answers[question.id]}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '0.5rem',
                                fontWeight: '600',
                                backgroundColor: '#CCA806',
                                color: '#1d1d1d',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                opacity: answers[question.id] ? 1 : 0.5
                            }}
                        >
                            <span>次へ</span>
                            <ArrowRight size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={onNext}
                            disabled={!answers[question.id]}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '0.5rem',
                                fontWeight: '600',
                                backgroundColor: '#CCA806',
                                color: '#1d1d1d',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                opacity: answers[question.id] ? 1 : 0.5
                            }}
                        >
                            <span>結果を見る</span>
                            <ArrowRight size={20} />
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const ResultsScreen = () => {
        const riskScore = calculateRisk();
        const result = getRiskLevel(riskScore);

        return (
            <div className="flex-col-gap-8">
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#CCA806' }}>診断結果</h2>

                <div style={{
                    backgroundColor: '#2a2a2a',
                    padding: '2rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #374151',
                    textAlign: 'center'
                }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '3.75rem', fontWeight: 'bold', marginBottom: '0.5rem', color: result.color }}>
                            {riskScore} / 3
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '600', color: result.color }}>
                            {result.level}
                        </div>
                    </div>
                    <p style={{ color: '#d1d5db', fontSize: '1.125rem' }}>{result.message}</p>
                </div>

                <div className="flex-col-gap-4">
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#e5e7eb' }}>回答の内訳</h3>
                    {questions.map((q, idx) => (
                        <div key={q.id} style={{
                            backgroundColor: '#2a2a2a',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #374151'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>チェック{idx + 1}</span>
                                <span style={{
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: answers[q.id] === 'yes' ? '#f87171' : '#4ade80'
                                }}>
                                    {answers[q.id] === 'yes' ? 'はい' : 'いいえ'}
                                </span>
                            </div>
                            <p style={{ fontSize: '0.875rem', color: '#d1d5db', marginTop: '0.5rem' }}>{q.title}</p>
                        </div>
                    ))}
                </div>

                <div style={{
                    backgroundColor: '#2a2a2a',
                    padding: '1.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #374151'
                }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#CCA806' }}>次のステップ</h3>
                    <p style={{ color: '#d1d5db' }}>
                        診断結果を元に、あなたの「尖」を見つけ、行動計画を立てていきましょう。
                    </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1.5rem' }}>
                    <button
                        onClick={() => setCurrentStep(1)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #4b5563',
                            backgroundColor: 'transparent',
                            color: '#e5e7eb',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <ArrowLeft size={20} />
                        <span>診断に戻る</span>
                    </button>
                    <button
                        onClick={() => setCurrentStep(3)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            fontWeight: '600',
                            backgroundColor: '#CCA806',
                            color: '#1d1d1d',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <span>ワークシートへ</span>
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        );
    };

    const WorksheetScreen = ({ worksheetData, onTogariChange, onRoleChange, onBack, onNext }) => {
        const togariRef = useRef(null);

        const handleTogariBlur = () => {
            if (togariRef.current) {
                onTogariChange({ target: { value: togariRef.current.value } });
            }
        };

        return (
            <div className="flex-col-gap-8">
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#CCA806' }}>あなたの「尖」を見つける</h2>

                <div className="flex-col-gap-6">
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: '#d1d5db' }}>
                            1. あなたの「尖」は何ですか?
                        </label>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                            「これなら何時間でも語れる」というテーマ、誰にも負けない独自の判断軸を書き出してください。
                        </p>
                        <textarea
                            ref={togariRef}
                            defaultValue={worksheetData.myTogari}
                            onBlur={handleTogariBlur}
                            placeholder="例:昭和のレトロゲームUIデザインの原則を体系化し、現代のプロダクトに応用すること"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                backgroundColor: '#2a2a2a',
                                border: '1px solid #374151',
                                color: '#ffffff',
                                minHeight: '120px',
                                fontSize: '1rem',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: '#d1d5db' }}>
                            2. 「舵取り」と「磨き手」、どちらを目指しますか?
                        </label>
                        <div className="flex-col-gap-3">
                            <div
                                onClick={() => onRoleChange('steering')}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                    backgroundColor: worksheetData.roleChoice === 'steering' ? 'rgba(204, 168, 6, 0.1)' : '#2a2a2a',
                                    border: worksheetData.roleChoice === 'steering' ? '2px solid #CCA806' : '1px solid #374151'
                                }}
                            >
                                <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#e5e7eb' }}>舵取り</div>
                                <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                                    AIを指揮し、戦略を決める。複数のプロジェクトを俯瞰し、全体最適を考える。
                                </p>
                            </div>
                            <div
                                onClick={() => onRoleChange('polishing')}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                    backgroundColor: worksheetData.roleChoice === 'polishing' ? 'rgba(204, 168, 6, 0.1)' : '#2a2a2a',
                                    border: worksheetData.roleChoice === 'polishing' ? '2px solid #CCA806' : '1px solid #374151'
                                }}
                            >
                                <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#e5e7eb' }}>磨き手</div>
                                <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                                    80点を100点に仕上げる。ニッチな領域をオタク的に突き詰める。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1.5rem' }}>
                    <button
                        onClick={onBack}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #4b5563',
                            backgroundColor: 'transparent',
                            color: '#e5e7eb',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <ArrowLeft size={20} />
                        <span>結果に戻る</span>
                    </button>
                    <button
                        onClick={onNext}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            fontWeight: '600',
                            backgroundColor: '#CCA806',
                            color: '#1d1d1d',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <span>行動計画へ</span>
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        );
    };

    const ActionPlanScreen = ({ worksheetData, answers, questions, onActionPlanChange, onBack, calculateRisk, getRiskLevel, isGeneratingPDF, setIsGeneratingPDF }) => {
        const riskScore = calculateRisk();
        const result = getRiskLevel(riskScore);
        const actionPlanRef = useRef(null);

        const handleActionPlanBlur = () => {
            if (actionPlanRef.current) {
                onActionPlanChange({ target: { value: actionPlanRef.current.value } });
            }
        };

        const downloadPDF = async () => {
            setIsGeneratingPDF(true);

            try {
                // Create PDF directly with jsPDF
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pageWidth = pdf.internal.pageSize.getWidth();
                let y = 20;

                // Title
                pdf.setFontSize(24);
                pdf.setTextColor(204, 168, 6); // Gold color
                pdf.text('尖（とがり）診断結果', pageWidth / 2, y, { align: 'center' });
                y += 20;

                // Score section
                pdf.setDrawColor(204, 168, 6);
                pdf.setLineWidth(0.5);
                pdf.rect(20, y, pageWidth - 40, 50);

                pdf.setFontSize(36);
                pdf.setTextColor(204, 168, 6);
                pdf.text(`${result.level}`, pageWidth / 2, y + 20, { align: 'center' });

                pdf.setFontSize(14);
                pdf.setTextColor(100, 100, 100);
                pdf.text(`スコア: ${riskScore} / 3`, pageWidth / 2, y + 32, { align: 'center' });

                pdf.setFontSize(11);
                pdf.setTextColor(50, 50, 50);
                const messageLines = pdf.splitTextToSize(result.message, pageWidth - 60);
                pdf.text(messageLines, pageWidth / 2, y + 42, { align: 'center' });
                y += 60;

                // Your "Togari"
                pdf.setFontSize(14);
                pdf.setTextColor(30, 30, 30);
                pdf.text('あなたの「尖」', 20, y);
                y += 8;

                pdf.setFontSize(11);
                pdf.setTextColor(60, 60, 60);
                const togariText = worksheetData.myTogari || '（未記入）';
                const togariLines = pdf.splitTextToSize(togariText, pageWidth - 40);
                pdf.text(togariLines, 20, y);
                y += togariLines.length * 6 + 10;

                // Role choice
                pdf.setFontSize(14);
                pdf.setTextColor(30, 30, 30);
                pdf.text('選択した役割', 20, y);
                y += 8;

                pdf.setFontSize(11);
                pdf.setTextColor(60, 60, 60);
                const roleText = worksheetData.roleChoice === 'steering' ? '舵取り' :
                    worksheetData.roleChoice === 'polishing' ? '磨き手' : '（未選択）';
                pdf.text(roleText, 20, y);
                y += 15;

                // Action plan
                pdf.setFontSize(14);
                pdf.setTextColor(30, 30, 30);
                pdf.text('3-5年の行動計画', 20, y);
                y += 8;

                pdf.setFontSize(11);
                pdf.setTextColor(60, 60, 60);
                const actionText = worksheetData.actionPlan || '（未記入）';
                const actionLines = pdf.splitTextToSize(actionText, pageWidth - 40);
                pdf.text(actionLines, 20, y);
                y += actionLines.length * 6 + 15;

                // Answers breakdown
                pdf.setFontSize(14);
                pdf.setTextColor(30, 30, 30);
                pdf.text('回答の内訳', 20, y);
                y += 10;

                questions.forEach((q, idx) => {
                    pdf.setFontSize(11);
                    pdf.setTextColor(100, 100, 100);
                    pdf.text(`チェック${idx + 1}:`, 20, y);

                    const answerText = answers[q.id] === 'yes' ? 'はい' : 'いいえ';
                    pdf.setTextColor(answers[q.id] === 'yes' ? 248 : 74, answers[q.id] === 'yes' ? 113 : 222, answers[q.id] === 'yes' ? 113 : 128);
                    pdf.text(answerText, pageWidth - 30, y);
                    y += 8;
                });

                y += 10;

                // Footer
                pdf.setFontSize(10);
                pdf.setTextColor(150, 150, 150);
                pdf.text(`診断日: ${new Date().toLocaleDateString('ja-JP')}`, 20, y);
                pdf.text('kuuki.design', pageWidth - 20, y, { align: 'right' });

                // Save PDF
                pdf.save('尖診断結果.pdf');
            } catch (error) {
                console.error('PDF generation failed:', error);
                alert('PDFの生成に失敗しました。もう一度お試しください。');
            } finally {
                setIsGeneratingPDF(false);
            }
        };

        return (
            <div className="flex-col-gap-8">
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#CCA806' }}>3-5年の行動計画</h2>

                <div style={{
                    backgroundColor: '#2a2a2a',
                    padding: '1.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #374151'
                }}>
                    <p style={{ color: '#d1d5db', marginBottom: '1rem' }}>
                        「尖」は一夜にして作れません。これは3-5年かけて磨いていくマラソンです。
                    </p>
                    <p style={{ color: '#d1d5db' }}>
                        今日から始められる具体的なアクションを書き出してください。
                    </p>
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: '#d1d5db' }}>
                        あなたの行動計画
                    </label>
                    <textarea
                        ref={actionPlanRef}
                        defaultValue={worksheetData.actionPlan}
                        onBlur={handleActionPlanBlur}
                        placeholder={`例:
1年目:レトロゲームUIの体系的な研究を開始。月1本の分析記事を書く
2年目:AIツールを使って実際のプロダクトに応用。ポートフォリオを作る
3年目:この分野での第一人者として認知されるよう、発信を強化
...`}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            backgroundColor: '#2a2a2a',
                            border: '1px solid #374151',
                            color: '#ffffff',
                            minHeight: '200px',
                            fontSize: '1rem',
                            resize: 'vertical'
                        }}
                    />
                </div>

                <div className="flex-col-gap-4">
                    <button
                        onClick={downloadPDF}
                        disabled={isGeneratingPDF}
                        style={{
                            width: '100%',
                            padding: '1rem 1.5rem',
                            borderRadius: '0.5rem',
                            fontWeight: '600',
                            backgroundColor: '#2a2a2a',
                            border: '1px solid #374151',
                            color: '#e5e7eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            opacity: isGeneratingPDF ? 0.5 : 1
                        }}
                    >
                        <Download size={20} />
                        <span>{isGeneratingPDF ? 'PDF生成中...' : 'PDFで保存'}</span>
                    </button>

                    <div style={{
                        backgroundColor: '#2a2a2a',
                        padding: '1.5rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #374151',
                        textAlign: 'center'
                    }}>
                        <p style={{ color: '#d1d5db', marginBottom: '1rem' }}>
                            この診断が「考えの種」になったなら、ぜひRioのチャンネルもチェックしてください。
                        </p>
                        <a
                            href="https://www.youtube.com/channel/UChXxbzzxzUHn7RRlgX0jaIQ"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '0.5rem',
                                fontWeight: '600',
                                backgroundColor: '#CCA806',
                                color: '#1d1d1d',
                                textDecoration: 'none'
                            }}
                        >
                            <Youtube size={20} />
                            <span>チャンネルを見る</span>
                        </a>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1.5rem' }}>
                    <button
                        onClick={onBack}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #4b5563',
                            backgroundColor: 'transparent',
                            color: '#e5e7eb',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <ArrowLeft size={20} />
                        <span>ワークシートに戻る</span>
                    </button>
                    <button
                        onClick={() => {
                            setCurrentStep(0);
                            setCurrentQ(0);
                        }}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #4b5563',
                            backgroundColor: 'transparent',
                            color: '#e5e7eb'
                        }}
                    >
                        最初に戻る
                    </button>
                </div>
            </div>
        );
    };

    return (
        <>
            <style>{`
        @keyframes floatRotate {
          0% { transform: translate(-50%, -50%) translateY(0px) rotate(0deg); }
          25% { transform: translate(-50%, -50%) translateY(-15px) rotate(90deg); }
          50% { transform: translate(-50%, -50%) translateY(0px) rotate(180deg); }
          75% { transform: translate(-50%, -50%) translateY(-15px) rotate(270deg); }
          100% { transform: translate(-50%, -50%) translateY(0px) rotate(360deg); }
        }
      `}</style>
            <div style={{
                minHeight: '100vh',
                backgroundColor: '#1d1d1d',
                color: '#f3f4f6',
                padding: '1rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Animated wireframe logo background */}
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0.07,
                    pointerEvents: 'none',
                    zIndex: 0,
                    animation: 'floatRotate 20s ease-in-out infinite'
                }}>
                    <svg width="800" height="800" viewBox="0 0 800 800">
                        <circle cx="400" cy="400" r="350" fill="none" stroke="#CCA806" strokeWidth="2" />
                        <circle cx="400" cy="380" r="180" fill="none" stroke="#CCA806" strokeWidth="2" />
                        <circle cx="400" cy="600" r="50" fill="none" stroke="#CCA806" strokeWidth="2" />
                    </svg>
                </div>

                <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '1rem', position: 'relative', zIndex: 1 }}>
                    {/* Step tabs */}
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                            {steps.map((step, idx) => (
                                <div
                                    key={step.id}
                                    onClick={() => setCurrentStep(idx)}
                                    style={{
                                        flexShrink: 0,
                                        padding: '0.5rem 1rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.875rem',
                                        fontWeight: idx === currentStep ? '600' : '400',
                                        backgroundColor: idx === currentStep ? 'rgba(204, 168, 6, 0.2)' : 'transparent',
                                        color: idx === currentStep ? '#CCA806' : '#6b7280',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {step.title}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Screen content */}
                    <div>
                        {currentStep === 0 && <IntroScreen />}
                        {currentStep === 1 && (
                            <AssessmentScreen
                                currentQ={currentQ}
                                setCurrentQ={setCurrentQ}
                                answers={answers}
                                setAnswers={setAnswers}
                                questions={questions}
                                onBack={() => setCurrentStep(0)}
                                onNext={() => setCurrentStep(2)}
                            />
                        )}
                        {currentStep === 2 && <ResultsScreen />}
                        {currentStep === 3 && (
                            <WorksheetScreen
                                worksheetData={worksheetData}
                                onTogariChange={handleTogariChange}
                                onRoleChange={handleRoleChange}
                                onBack={() => setCurrentStep(2)}
                                onNext={() => setCurrentStep(4)}
                            />
                        )}
                        {currentStep === 4 && (
                            <ActionPlanScreen
                                worksheetData={worksheetData}
                                answers={answers}
                                questions={questions}
                                onActionPlanChange={handleActionPlanChange}
                                onBack={() => setCurrentStep(3)}
                                calculateRisk={calculateRisk}
                                getRiskLevel={getRiskLevel}
                                isGeneratingPDF={isGeneratingPDF}
                                setIsGeneratingPDF={setIsGeneratingPDF}
                            />
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{
                        marginTop: '3rem',
                        paddingTop: '2rem',
                        borderTop: '1px solid #374151',
                        textAlign: 'center',
                        fontSize: '0.875rem',
                        color: '#6b7280'
                    }}>
                        <p>© 2026 Rio | Kuuki Design</p>
                        <p style={{ marginTop: '0.5rem' }}>このツールのデータはあなたのブラウザにのみ保存され、外部に送信されることはありません。</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TogariAssessment;
