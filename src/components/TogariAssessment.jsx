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
    const printRef = useRef(null);

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

    // Memoized handlers to prevent unnecessary re-renders
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
        <div className="gap-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4" style={{ color: '#CCA806' }}>
                    尖(とがり)診断
                </h1>
                <p className="text-xl text-gray-300 mb-2">AI時代を生き抜くためのセルフチェック</p>
                <p className="text-sm text-gray-500">by Kuuki Design</p>
            </div>

            <div className="gap-y-4 text-gray-300">
                <p className="text-lg leading-relaxed">
                    2026年以降、AIは「チャットボット」から「自律型エージェント」へと進化します。
                </p>
                <p className="text-lg leading-relaxed">
                    この変化の中で、あなたの仕事は「置き換えられる側」なのか、
                    それとも「AIを指揮する側」なのか。
                </p>
                <p className="text-lg leading-relaxed">
                    この診断では、あなたの「尖度」をチェックし、
                    これから磨くべきスキルと方向性を見つけ出します。
                </p>
            </div>

            <div className="bg-[#2a2a2a] p-6 rounded-lg border border-gray-800">
                <h3 className="text-lg font-semibold mb-3" style={{ color: '#CCA806' }}>この診断でわかること</h3>
                <ul className="gap-y-2 text-gray-300">
                    <li>✓ あなたの業務がAIに置き換えられるリスク度</li>
                    <li>✓ 「舵取り」と「磨き手」、どちらを目指すべきか</li>
                    <li>✓ 3-5年の具体的な行動計画</li>
                </ul>
            </div>

            <div className="flex items-center justify-center gap-4 pt-4">
                <a
                    href="https://www.youtube.com/channel/UChXxbzzxzUHn7RRlgX0jaIQ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                    <Youtube size={20} />
                    <span className="text-sm">Rioのチャンネルを見る</span>
                </a>
            </div>

            <button
                onClick={() => setCurrentStep(1)}
                className="w-full py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ backgroundColor: '#CCA806', color: '#1d1d1d' }}
            >
                <span>診断を始める</span>
                <ArrowRight size={20} />
            </button>
        </div>
    );

    const AssessmentScreen = React.memo(({
        currentQ,
        setCurrentQ,
        answers,
        setAnswers,
        questions,
        onBack,
        onNext
    }) => {
        const question = questions[currentQ];

        return (
            <div className="gap-y-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold" style={{ color: '#CCA806' }}>尖度セルフチェック</h2>
                    <span className="text-sm text-gray-500">{currentQ + 1} / {questions.length}</span>
                </div>

                <div className="gap-y-6">
                    <div>
                        <h3 className="text-xl font-semibold mb-3 text-gray-200">{question.title}</h3>
                        <p className="text-gray-400 mb-4">{question.description}</p>
                    </div>

                    <div className="bg-[#2a2a2a] p-6 rounded-lg border border-gray-800">
                        <p className="text-sm font-semibold mb-3 text-gray-400">具体例:</p>
                        <ul className="gap-y-2">
                            {question.examples.map((example, idx) => (
                                <li key={idx} className="text-sm text-gray-300 flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>{example}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="gap-y-4">
                        <button
                            onClick={() => setAnswers({ ...answers, [question.id]: 'yes' })}
                            className={`w-full py-4 rounded-lg font-semibold transition-all ${answers[question.id] === 'yes'
                                ? 'border-2'
                                : 'bg-[#2a2a2a] border border-gray-800 hover:border-gray-700'
                                }`}
                            style={answers[question.id] === 'yes' ? {
                                borderColor: '#CCA806',
                                backgroundColor: 'rgba(204, 168, 6, 0.1)'
                            } : {}}
                        >
                            はい、当てはまります
                        </button>
                        <button
                            onClick={() => setAnswers({ ...answers, [question.id]: 'no' })}
                            className={`w-full py-4 rounded-lg font-semibold transition-all ${answers[question.id] === 'no'
                                ? 'border-2'
                                : 'bg-[#2a2a2a] border border-gray-800 hover:border-gray-700'
                                }`}
                            style={answers[question.id] === 'no' ? {
                                borderColor: '#CCA806',
                                backgroundColor: 'rgba(204, 168, 6, 0.1)'
                            } : {}}
                        >
                            いいえ、当てはまりません
                        </button>
                    </div>
                </div>

                <div className="flex justify-between pt-6">
                    <button
                        onClick={() => currentQ > 0 ? setCurrentQ(currentQ - 1) : onBack()}
                        className="px-6 py-3 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors flex items-center gap-2"
                    >
                        <ArrowLeft size={20} />
                        <span>戻る</span>
                    </button>
                    {currentQ < questions.length - 1 ? (
                        <button
                            onClick={() => setCurrentQ(currentQ + 1)}
                            disabled={!answers[question.id]}
                            className="px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#CCA806', color: '#1d1d1d' }}
                        >
                            <span>次へ</span>
                            <ArrowRight size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={onNext}
                            disabled={!answers[question.id]}
                            className="px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#CCA806', color: '#1d1d1d' }}
                        >
                            <span>結果を見る</span>
                            <ArrowRight size={20} />
                        </button>
                    )}
                </div>
            </div>
        );
    });

    const ResultsScreen = () => {
        const riskScore = calculateRisk();
        const result = getRiskLevel(riskScore);

        return (
            <div className="gap-y-8">
                <h2 className="text-2xl font-bold" style={{ color: '#CCA806' }}>診断結果</h2>

                <div className="bg-[#2a2a2a] p-8 rounded-lg border border-gray-800 text-center">
                    <div className="mb-6">
                        <div className="text-6xl font-bold mb-2" style={{ color: result.color }}>
                            {riskScore} / 3
                        </div>
                        <div className="text-xl font-semibold" style={{ color: result.color }}>
                            {result.level}
                        </div>
                    </div>
                    <p className="text-gray-300 text-lg">{result.message}</p>
                </div>

                <div className="gap-y-4">
                    <h3 className="text-lg font-semibold text-gray-200">回答の内訳</h3>
                    {questions.map((q, idx) => (
                        <div key={q.id} className="bg-[#2a2a2a] p-4 rounded-lg border border-gray-800">
                            <div className="flex justify-between items-start">
                                <span className="text-sm text-gray-400">チェック{idx + 1}</span>
                                <span
                                    className="text-sm font-semibold"
                                    style={{ color: answers[q.id] === 'yes' ? '#f87171' : '#4ade80' }}
                                >
                                    {answers[q.id] === 'yes' ? 'はい' : 'いいえ'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-300 mt-2">{q.title}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-[#2a2a2a] p-6 rounded-lg border border-gray-800">
                    <h3 className="text-lg font-semibold mb-3" style={{ color: '#CCA806' }}>次のステップ</h3>
                    <p className="text-gray-300 mb-4">
                        診断結果を元に、あなたの「尖」を見つけ、行動計画を立てていきましょう。
                    </p>
                </div>

                <div className="flex justify-between pt-6">
                    <button
                        onClick={() => setCurrentStep(1)}
                        className="px-6 py-3 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors flex items-center gap-2"
                    >
                        <ArrowLeft size={20} />
                        <span>診断に戻る</span>
                    </button>
                    <button
                        onClick={() => setCurrentStep(3)}
                        className="px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
                        style={{ backgroundColor: '#CCA806', color: '#1d1d1d' }}
                    >
                        <span>ワークシートへ</span>
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        );
    };

    const WorksheetScreen = React.memo(({
        worksheetData,
        onTogariChange,
        onRoleChange,
        onBack,
        onNext
    }) => {
        const togariRef = React.useRef(null);

        const handleTogariBlur = () => {
            if (togariRef.current) {
                onTogariChange({ target: { value: togariRef.current.value } });
            }
        };

        return (
            <div className="gap-y-8">
                <h2 className="text-2xl font-bold" style={{ color: '#CCA806' }}>あなたの「尖」を見つける</h2>

                <div className="gap-y-6">
                    <div>
                        <label className="block text-sm font-semibold mb-3 text-gray-300">
                            1. あなたの「尖」は何ですか?
                        </label>
                        <p className="text-sm text-gray-500 mb-3">
                            「これなら何時間でも語れる」というテーマ、誰にも負けない独自の判断軸を書き出してください。
                        </p>
                        <textarea
                            ref={togariRef}
                            defaultValue={worksheetData.myTogari}
                            onBlur={handleTogariBlur}
                            className="w-full p-4 rounded-lg bg-[#2a2a2a] border border-gray-800 focus:border-[#CCA806] focus:outline-none text-white min-h-[120px]"
                            placeholder="例:昭和のレトロゲームUIデザインの原則を体系化し、現代のプロダクトに応用すること"
                            style={{ color: '#ffffff', backgroundColor: '#2a2a2a' }}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-3 text-gray-300">
                            2. 「舵取り」と「磨き手」、どちらを目指しますか?
                        </label>
                        <div className="gap-y-3">
                            <div
                                onClick={() => onRoleChange('steering')}
                                className={`p-4 rounded-lg cursor-pointer transition-all ${worksheetData.roleChoice === 'steering'
                                    ? 'border-2'
                                    : 'bg-[#2a2a2a] border border-gray-800 hover:border-gray-700'
                                    }`}
                                style={worksheetData.roleChoice === 'steering' ? {
                                    borderColor: '#CCA806',
                                    backgroundColor: 'rgba(204, 168, 6, 0.1)'
                                } : {}}
                            >
                                <div className="font-semibold mb-2 text-gray-200">舵取り</div>
                                <p className="text-sm text-gray-400">
                                    AIを指揮し、戦略を決める。複数のプロジェクトを俯瞰し、全体最適を考える。
                                </p>
                            </div>
                            <div
                                onClick={() => onRoleChange('polishing')}
                                className={`p-4 rounded-lg cursor-pointer transition-all ${worksheetData.roleChoice === 'polishing'
                                    ? 'border-2'
                                    : 'bg-[#2a2a2a] border border-gray-800 hover:border-gray-700'
                                    }`}
                                style={worksheetData.roleChoice === 'polishing' ? {
                                    borderColor: '#CCA806',
                                    backgroundColor: 'rgba(204, 168, 6, 0.1)'
                                } : {}}
                            >
                                <div className="font-semibold mb-2 text-gray-200">磨き手</div>
                                <p className="text-sm text-gray-400">
                                    80点を100点に仕上げる。ニッチな領域をオタク的に突き詰める。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between pt-6">
                    <button
                        onClick={onBack}
                        className="px-6 py-3 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors flex items-center gap-2"
                    >
                        <ArrowLeft size={20} />
                        <span>結果に戻る</span>
                    </button>
                    <button
                        onClick={onNext}
                        className="px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
                        style={{ backgroundColor: '#CCA806', color: '#1d1d1d' }}
                    >
                        <span>行動計画へ</span>
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        );
    });

    const ActionPlanScreen = React.memo(({
        worksheetData,
        answers,
        questions,
        onActionPlanChange,
        onBack,
        calculateRisk,
        getRiskLevel,
        printRef,
        isGeneratingPDF,
        setIsGeneratingPDF
    }) => {
        const riskScore = calculateRisk();
        const result = getRiskLevel(riskScore);
        const actionPlanRef = React.useRef(null);

        const handleActionPlanBlur = () => {
            if (actionPlanRef.current) {
                onActionPlanChange({ target: { value: actionPlanRef.current.value } });
            }
        };

        const downloadPDF = async () => {
            setIsGeneratingPDF(true);

            try {
                // Create a temporary container for PDF content
                const pdfContainer = document.createElement('div');
                pdfContainer.style.cssText = `
          position: absolute;
          left: -9999px;
          top: 0;
          width: 800px;
          padding: 40px;
          background: white;
          color: #1d1d1d;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', sans-serif;
        `;

                pdfContainer.innerHTML = `
          <div style="margin-bottom: 30px;">
            <svg width="40" height="40" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="#1d1d1d" stroke-width="2"/>
              <circle cx="50" cy="48" r="22" fill="none" stroke="#1d1d1d" stroke-width="2"/>
              <circle cx="50" cy="75" r="6" fill="none" stroke="#1d1d1d" stroke-width="2"/>
            </svg>
          </div>
          
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-size: 28px; font-weight: bold; margin: 0;">尖（とがり）診断結果</h1>
          </div>
          
          <div style="text-align: center; padding: 40px 20px; margin-bottom: 30px; border: 2px solid #CCA806; border-radius: 8px;">
            <div style="font-size: 36px; font-weight: bold; color: #CCA806; margin-bottom: 8px;">${result.level}</div>
            <div style="font-size: 18px; color: #666; margin-bottom: 16px;">スコア: ${riskScore} / 3</div>
            <p style="font-size: 16px; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">${result.message}</p>
          </div>
          
          <div style="background: white; padding: 24px; margin-bottom: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">あなたの「尖」</h3>
            <p style="font-size: 15px; line-height: 1.8; color: #333; white-space: pre-wrap;">${worksheetData.myTogari || '（未記入）'}</p>
          </div>
          
          <div style="display: flex; gap: 20px; margin-bottom: 20px;">
            <div style="flex: 1; padding: 16px; border: ${worksheetData.roleChoice === 'steering' ? '2px solid #CCA806' : '1px solid #e0e0e0'}; border-radius: 8px; text-align: center; ${worksheetData.roleChoice === 'steering' ? 'background-color: rgba(204, 168, 6, 0.05);' : ''}">
              <h4 style="font-size: 16px; font-weight: 600; margin: 0;">舵取り</h4>
            </div>
            <div style="flex: 1; padding: 16px; border: ${worksheetData.roleChoice === 'polishing' ? '2px solid #CCA806' : '1px solid #e0e0e0'}; border-radius: 8px; text-align: center; ${worksheetData.roleChoice === 'polishing' ? 'background-color: rgba(204, 168, 6, 0.05);' : ''}">
              <h4 style="font-size: 16px; font-weight: 600; margin: 0;">磨き手</h4>
            </div>
          </div>
          
          <div style="background: white; padding: 24px; margin-bottom: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">3-5年の行動計画</h3>
            <p style="font-size: 15px; line-height: 1.8; color: #333; white-space: pre-wrap;">${worksheetData.actionPlan || '（未記入）'}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">回答の内訳</h3>
            ${questions.map((q, idx) => `
              <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; border-bottom: 1px solid #f0f0f0;">
                <span style="color: #666;">チェック${idx + 1}:</span>
                <span style="color: #333; font-weight: 500;">${answers[q.id] === 'yes' ? 'はい' : 'いいえ'}</span>
              </div>
            `).join('')}
          </div>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; display: flex; justify-content: space-between; align-items: flex-end;">
            <div style="font-size: 12px; color: #666;">
              <p style="margin-bottom: 4px;">診断日: ${new Date().toLocaleDateString('ja-JP')}</p>
              <p style="color: #999; margin: 0;">kuuki.design</p>
            </div>
          </div>
        `;

                document.body.appendChild(pdfContainer);

                const canvas = await html2canvas(pdfContainer, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff'
                });

                document.body.removeChild(pdfContainer);

                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
                const imgX = (pdfWidth - imgWidth * ratio) / 2;
                const imgY = 0;

                pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
                pdf.save('尖診断結果.pdf');
            } catch (error) {
                console.error('PDF generation failed:', error);
                alert('PDFの生成に失敗しました。もう一度お試しください。');
            } finally {
                setIsGeneratingPDF(false);
            }
        };

        return (
            <div className="gap-y-8">
                <h2 className="text-2xl font-bold" style={{ color: '#CCA806' }}>3-5年の行動計画</h2>

                <div className="bg-[#2a2a2a] p-6 rounded-lg border border-gray-800">
                    <p className="text-gray-300 mb-4">
                        「尖」は一夜にして作れません。これは3-5年かけて磨いていくマラソンです。
                    </p>
                    <p className="text-gray-300">
                        今日から始められる具体的なアクションを書き出してください。
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-300">
                        あなたの行動計画
                    </label>
                    <textarea
                        ref={actionPlanRef}
                        defaultValue={worksheetData.actionPlan}
                        onBlur={handleActionPlanBlur}
                        className="w-full p-4 rounded-lg bg-[#2a2a2a] border border-gray-800 focus:border-[#CCA806] focus:outline-none text-white min-h-[200px]"
                        placeholder="例:
1年目:レトロゲームUIの体系的な研究を開始。月1本の分析記事を書く
2年目:AIツールを使って実際のプロダクトに応用。ポートフォリオを作る
3年目:この分野での第一人者として認知されるよう、発信を強化
..."
                        style={{ color: '#ffffff', backgroundColor: '#2a2a2a' }}
                    />
                </div>

                <div className="gap-y-4">
                    <button
                        onClick={downloadPDF}
                        disabled={isGeneratingPDF}
                        className="w-full py-4 rounded-lg font-semibold flex items-center justify-center gap-2 bg-[#2a2a2a] border border-gray-800 hover:border-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download size={20} />
                        <span>{isGeneratingPDF ? 'PDF生成中...' : 'PDFで保存'}</span>
                    </button>

                    <div className="bg-[#2a2a2a] p-6 rounded-lg border border-gray-800 text-center">
                        <p className="text-gray-300 mb-4">
                            この診断が「考えの種」になったなら、ぜひRioのチャンネルもチェックしてください。
                        </p>
                        <a
                            href="https://www.youtube.com/channel/UChXxbzzxzUHn7RRlgX0jaIQ"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-90"
                            style={{ backgroundColor: '#CCA806', color: '#1d1d1d' }}
                        >
                            <Youtube size={20} />
                            <span>チャンネルを見る</span>
                        </a>
                    </div>
                </div>

                <div className="flex justify-between pt-6">
                    <button
                        onClick={onBack}
                        className="px-6 py-3 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors flex items-center gap-2"
                    >
                        <ArrowLeft size={20} />
                        <span>ワークシートに戻る</span>
                    </button>
                    <button
                        onClick={() => {
                            setCurrentStep(0);
                            setCurrentQ(0);
                        }}
                        className="px-6 py-3 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                    >
                        最初に戻る
                    </button>
                </div>
            </div>
        );
    });

    return (
        <>
            <style>{`
        @keyframes floatRotate {
          0% {
            transform: translate(-50%, -50%) translateY(0px) rotate(0deg);
          }
          25% {
            transform: translate(-50%, -50%) translateY(-15px) rotate(90deg);
          }
          50% {
            transform: translate(-50%, -50%) translateY(0px) rotate(180deg);
          }
          75% {
            transform: translate(-50%, -50%) translateY(-15px) rotate(270deg);
          }
          100% {
            transform: translate(-50%, -50%) translateY(0px) rotate(360deg);
          }
        }
      `}</style>
            <div className="min-h-screen text-gray-100 p-4 md:p-8" style={{ backgroundColor: '#1d1d1d', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
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
                <div className="max-w-3xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
                    <div className="mb-8">
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {steps.map((step, idx) => (
                                <div
                                    key={step.id}
                                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition-all ${idx === currentStep ? 'font-semibold' : 'text-gray-500'
                                        }`}
                                    style={idx === currentStep ? {
                                        backgroundColor: 'rgba(204, 168, 6, 0.2)',
                                        color: '#CCA806'
                                    } : {}}
                                >
                                    {step.title}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#1d1d1d]">
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
                                printRef={printRef}
                                isGeneratingPDF={isGeneratingPDF}
                                setIsGeneratingPDF={setIsGeneratingPDF}
                            />
                        )}
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
                        <p>© 2026 Rio | Kuuki Design</p>
                        <p className="mt-2">このツールのデータはあなたのブラウザにのみ保存され、外部に送信されることはありません。</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TogariAssessment;
