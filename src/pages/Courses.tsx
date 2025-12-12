import React, { useState, useEffect } from 'react';
import { Download, BookOpen, CheckCircle, XCircle, FileText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Course } from '../types/course';
import { getInitialCourses } from '../data/courses';
import jsPDF from "jspdf";
import NotoSansArmenian from "../fonts/NotoSansArmenian-normal.js";

export const Courses: React.FC = () => {
    const { t, language } = useLanguage();
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [showQuiz, setShowQuiz] = useState(false);
    const [showCourse, setShowCourse] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [visibleLength, setVisibleLength] = useState(300);

    const handleShowMore = () => setVisibleLength(prev => prev + 300);

    const highlightText = (text: string) => {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.split(regex).map((part, index) =>
            regex.test(part)
                ? <mark key={index} className="bg-yellow-200">{part}</mark>
                : part
        );
    };

    /* -------------------- LOAD COURSES & TRANSLATE PDF CONTENT -------------------- */
    useEffect(() => {
        async function loadCourses() {

            // Load static courses
            const original = getInitialCourses("hy");

            // Load admin panel data
            const localData = JSON.parse(localStorage.getItem("courses") || "[]");

            // Choose correct list
            const finalCourses = localData.length > 0 ? localData : original;

            if (language === "hy") {
                setCourses(finalCourses);
                return;
            }

           
           
        }

        loadCourses();
    }, [language]);

    /* -------------------- PDF DOWNLOAD -------------------- */
   
   

    const handleDownloadPDF = (course: Course) => {
        const pdf = new jsPDF();

        // Add Armenian font 
        pdf.addFileToVFS("NotoSansArmenian.ttf", NotoSansArmenian);
        pdf.addFont("NotoSansArmenian.ttf", "NotoSansArmenian", "normal");
        pdf.setFont("NotoSansArmenian");

        // Split long text into lines
        const lines = pdf.splitTextToSize(course.pdfContent, 180);
        pdf.text(lines, 10, 10);

        pdf.save(`${course.title}.pdf`);
    };


    /* -------------------- COURSE VIEW -------------------- */
    const handleStartCourse = (course: Course) => {
        setSelectedCourse(course);
        setShowCourse(true);
        setShowQuiz(false);
        setVisibleLength(300);
    };

    /* -------------------- QUIZ LOGIC -------------------- */
    const handleStartQuiz = (course: Course) => {
        setSelectedCourse(course);
        setShowQuiz(true);
        setShowCourse(false);
        setQuizAnswers(new Array(course.quiz.length).fill(-1));
        setQuizSubmitted(false);
        setScore(0);
    };

    const handleAnswerSelect = (i: number, j: number) => {
        const newAnswers = [...quizAnswers];
        newAnswers[i] = j;
        setQuizAnswers(newAnswers);
    };

    const handleSubmitQuiz = () => {
        if (!selectedCourse) return;
        let correct = 0;
        selectedCourse.quiz.forEach((q, i) => {
            if (quizAnswers[i] === q.correctAnswer) correct++;
        });
        setScore(correct);
        setQuizSubmitted(true);
    };

    const handleRetryQuiz = () => {
        setQuizAnswers(new Array(selectedCourse!.quiz.length).fill(-1));
        setQuizSubmitted(false);
        setScore(0);
    };

    const handleBackToCourses = () => {
        setSelectedCourse(null);
        setShowQuiz(false);
        setShowCourse(false);
    };

    /* -------------------- COURSE READING MODE -------------------- */
    if (showCourse && selectedCourse) {
        return (
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={handleBackToCourses}
                        className="mb-6 text-blue-600 hover:text-blue-800 font-medium"
                    >
                        ← {language === 'hy' ? 'Վերադառնալ դասերին' : 'Back to Courses'}
                    </button>

                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <h2 className="text-3xl font-bold text-slate-800 mb-6">
                            {selectedCourse.title}
                        </h2>

                       
                        {/* -------------------- VIDEOS -------------------- */}
                        {selectedCourse.videos && selectedCourse.videos.length > 0 && (
                            <div className="mt-8 space-y-6">
                                {selectedCourse.videos.map((url, index) => {
                                    const videoId = url.includes("youtu.be")
                                        ? url.split("/").pop()
                                        : new URL(url).searchParams.get("v");

                                    if (!videoId) return null;

                                    return (
                                        <iframe
                                            key={index}
                                            width="400"
                                            height="315"
                                            src={`https://www.youtube.com/embed/${videoId}`}
                                            title={`Video ${index + 1}`}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="rounded-xl shadow-lg"
                                        ></iframe>
                                    );
                                })}
                            </div>
                        )}


                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={language === 'hy' ? 'Որոնել...' : 'Search...'}
                            className="w-full border rounded-lg px-4 py-2 mb-4"
                        />
                        <div className="prose whitespace-pre-wrap">
                            {highlightText(selectedCourse.pdfContent.slice(0, visibleLength))}
                        </div>
                       
                        {visibleLength < selectedCourse.pdfContent.length && (
                            <div className="mt-6 text-center">
                                <button
                                    onClick={handleShowMore}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg"
                                >
                                    {language === 'hy' ? 'Դիտել ավելին' : 'Show More'}
                                </button>
                            </div>
                        )}

                        <div className="mt-8 flex gap-4">
                            <button
                                onClick={() => handleDownloadPDF(selectedCourse)}
                                className="flex-1 bg-slate-100 py-3 rounded-lg"
                            >
                                <Download className="inline mr-2" /> {t.courses.downloadPdf}
                            </button>

                            <button
                                onClick={() => handleStartQuiz(selectedCourse)}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg"
                            >
                                {t.courses.startQuiz}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* -------------------- QUIZ MODE -------------------- */
    if (showQuiz && selectedCourse) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={handleBackToCourses}
                        className="mb-6 text-blue-600 font-medium"
                    >
                        ← {language === 'hy' ? 'Վերադառնալ' : 'Back'}
                    </button>

                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <h2 className="text-3xl font-bold mb-8">{selectedCourse.title}</h2>

                        {!quizSubmitted ? (
                            <>
                                {selectedCourse.quiz.map((q, qi) => (
                                    <div key={qi} className="mb-8">
                                        <p className="font-semibold mb-3">{qi + 1}. {q.question}</p>

                                        {q.options.map((opt, oi) => (
                                            <label
                                                key={oi}
                                                className={`block border p-3 rounded-lg mb-2 cursor-pointer ${quizAnswers[qi] === oi ? "bg-blue-50 border-blue-500" : "border-slate-300"}`}
                                            >
                                                <input
                                                    type="radio"
                                                    checked={quizAnswers[qi] === oi}
                                                    onChange={() => handleAnswerSelect(qi, oi)}
                                                    className="mr-2"
                                                />
                                                {opt}
                                            </label>
                                        ))}
                                    </div>
                                ))}

                                <button
                                    onClick={handleSubmitQuiz}
                                    disabled={quizAnswers.includes(-1)}
                                    className="w-full bg-blue-600 text-white py-4 rounded-lg"
                                >
                                    {t.courses.submitQuiz}
                                </button>
                            </>
                        ) : (
                            <>
                                <h3 className="text-xl font-bold mb-6">
                                    {t.courses.score}: {score}/{selectedCourse.quiz.length}
                                </h3>

                                {selectedCourse.quiz.map((q, i) => (
                                    <div key={i} className="mb-6 p-4 border rounded-lg">
                                        {quizAnswers[i] === q.correctAnswer ? (
                                            <CheckCircle className="text-green-500 mb-2" />
                                        ) : (
                                            <XCircle className="text-red-500 mb-2" />
                                        )}

                                        <p className="font-semibold">{q.question}</p>
                                        <p className="mt-1">
                                            {language === 'hy' ? 'Ձեր պատասխան:' : 'Your answer:'}{" "}
                                            <span className={quizAnswers[i] === q.correctAnswer ? "text-green-600" : "text-red-600"}>
                                                {q.options[quizAnswers[i]]}
                                            </span>
                                        </p>

                                        {quizAnswers[i] !== q.correctAnswer && (
                                            <p className="mt-1 text-green-600">
                                                {language === 'hy' ? 'Ճիշտ պատասխան:' : 'Correct answer:'}{" "}
                                                {q.options[q.correctAnswer]}
                                            </p>
                                        )}
                                    </div>
                                ))}

                                <button
                                    onClick={handleRetryQuiz}
                                    className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg"
                                >
                                    {t.courses.retryQuiz}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    /* -------------------- COURSE LIST -------------------- */
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-12">{t.courses.title}</h1>

                <div className="grid md:grid-cols-2 gap-8">
                    {courses.map((course) => (
                        <div key={course.id} className="bg-white rounded-2xl shadow-lg p-8">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-16 h-16 bg-blue-500 text-white rounded-xl flex items-center justify-center">
                                    <BookOpen size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{course.title}</h2>
                                    <p className="text-slate-600">{course.description}</p>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => handleStartCourse(course)}
                                    className="flex-1 bg-slate-100 py-3 rounded-lg"
                                >
                                    <FileText className="inline mr-2" />
                                    {language === 'hy' ? 'Սկսել դասը' : 'Start Course'}
                                </button>

                                <button
                                    onClick={() => handleStartQuiz(course)}
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg"
                                >
                                    {t.courses.startQuiz}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
