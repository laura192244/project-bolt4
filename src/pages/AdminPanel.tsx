import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Course, Question } from '../types/course';

export const AdminPanel: React.FC = () => {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  useEffect(() => {
    const storedCourses = localStorage.getItem('courses');
    if (storedCourses) {
      setCourses(JSON.parse(storedCourses));
    }
  }, []);

  const saveCourses = (updatedCourses: Course[]) => {
    setCourses(updatedCourses);
    localStorage.setItem('courses', JSON.stringify(updatedCourses));
  };

  const handleAddCourse = () => {
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      title: '',
      description: '',
      pdfContent: '',
      quiz: [
        { question: '', options: ['', '', '', ''], correctAnswer: 0 }
      ]
    };
    setEditingCourse(newCourse);
    setIsEditing(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse({ ...course });
    setIsEditing(true);
  };

  const handleDeleteCourse = (courseId: string) => {
    if (confirm(t.language === 'hy' ? 'Հեռացնել այս դասը?' : 'Delete this course?')) {
      const updatedCourses = courses.filter(c => c.id !== courseId);
      saveCourses(updatedCourses);
    }
  };

  const handleSaveCourse = () => {
    if (!editingCourse) return;

    if (!editingCourse.title || !editingCourse.description) {
      alert(t.language === 'hy' ? 'Լրացրեք բոլոր դաշտերը' : 'Please fill all fields');
      return;
    }

    const existingIndex = courses.findIndex(c => c.id === editingCourse.id);

    if (existingIndex !== -1) {
      const updatedCourses = [...courses];
      updatedCourses[existingIndex] = editingCourse;
      saveCourses(updatedCourses);
    } else {
      saveCourses([...courses, editingCourse]);
    }

    setIsEditing(false);
    setEditingCourse(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingCourse(null);
  };

  const updateCourseField = (field: keyof Course, value: string) => {
    if (editingCourse) {
      setEditingCourse({ ...editingCourse, [field]: value });
    }
  };

  const addQuestion = () => {
    if (editingCourse) {
      setEditingCourse({
        ...editingCourse,
        quiz: [
          ...editingCourse.quiz,
          { question: '', options: ['', '', '', ''], correctAnswer: 0 }
        ]
      });
    }
  };

  const updateQuestion = (index: number, field: keyof Question | 'option', value: string | number, optionIndex?: number) => {
    if (!editingCourse) return;

    const updatedQuiz = [...editingCourse.quiz];

    if (field === 'option' && optionIndex !== undefined) {
      updatedQuiz[index].options[optionIndex] = value as string;
    } else if (field === 'question') {
      updatedQuiz[index].question = value as string;
    } else if (field === 'correctAnswer') {
      updatedQuiz[index].correctAnswer = value as number;
    }

    setEditingCourse({ ...editingCourse, quiz: updatedQuiz });
  };

  const removeQuestion = (index: number) => {
    if (editingCourse && editingCourse.quiz.length > 1) {
      setEditingCourse({
        ...editingCourse,
        quiz: editingCourse.quiz.filter((_, i) => i !== index)
      });
    }
  };

  if (isEditing && editingCourse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                {editingCourse.title ? t.adminPanel.editCourse : t.adminPanel.addCourse}
              </h2>
              <button
                onClick={handleCancel}
                className="text-slate-600 hover:text-slate-800"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t.adminPanel.courseName}
                </label>
                <input
                  type="text"
                  value={editingCourse.title}
                  onChange={(e) => updateCourseField('title', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t.adminPanel.courseDescription}
                </label>
                <textarea
                  value={editingCourse.description}
                  onChange={(e) => updateCourseField('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t.language === 'hy' ? 'PDF Բովանդակություն' : 'PDF Content'}
                            </label>

                <textarea
                  value={editingCourse.pdfContent}
                  onChange={(e) => updateCourseField('pdfContent', e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
                        </div>
                        {/* -------------------- VIDEOS -------------------- */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                {t.language === 'hy' ? 'YouTube Տեսանյութեր' : 'YouTube Videos'}
                            </label>

                            {editingCourse.videos?.map((video, index) => (
                                <div key={index} className="flex items-center gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={video}
                                        onChange={(e) => {
                                            const newVideos = [...editingCourse.videos];
                                            newVideos[index] = e.target.value;
                                            setEditingCourse({ ...editingCourse, videos: newVideos });
                                        }}
                                        placeholder="YouTube URL"
                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                                    />
                                    <button
                                        onClick={() => {
                                            const newVideos = editingCourse.videos.filter((_, i) => i !== index);
                                            setEditingCourse({ ...editingCourse, videos: newVideos });
                                        }}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}

                            <button
                                onClick={() => {
                                    const newVideos = editingCourse.videos ? [...editingCourse.videos, ''] : [''];
                                    setEditingCourse({ ...editingCourse, videos: newVideos });
                                }}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus size={16} />
                                {t.language === 'hy' ? 'Ավելացնել տեսանյութ' : 'Add Video'}
                            </button>
                        </div>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-slate-700">
                    {t.language === 'hy' ? 'Թեստի հարցեր' : 'Quiz Questions'}
                  </label>
                  <button
                    onClick={addQuestion}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={16} />
                    {t.language === 'hy' ? 'Ավելացնել հարց' : 'Add Question'}
                  </button>
                </div>

                <div className="space-y-6">
                  {editingCourse.quiz.map((question, qIndex) => (
                    <div key={qIndex} className="border border-slate-300 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-slate-800">
                          {t.language === 'hy' ? 'Հարց' : 'Question'} {qIndex + 1}
                        </h4>
                        {editingCourse.quiz.length > 1 && (
                          <button
                            onClick={() => removeQuestion(qIndex)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                        placeholder={t.language === 'hy' ? 'Հարցի տեքստ' : 'Question text'}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-3"
                      />

                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={question.correctAnswer === oIndex}
                              onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateQuestion(qIndex, 'option', e.target.value, oIndex)}
                              placeholder={`${t.language === 'hy' ? 'Տարբերակ' : 'Option'} ${oIndex + 1}`}
                              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveCourse}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all"
                >
                  <Save size={20} />
                  {t.adminPanel.save}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-slate-200 text-slate-800 py-3 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
                >
                  {t.adminPanel.cancel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800">{t.adminPanel.title}</h1>
          <button
            onClick={handleAddCourse}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg"
          >
            <Plus size={20} />
            {t.adminPanel.addCourse}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-2">{course.title}</h3>
              <p className="text-slate-600 mb-4 line-clamp-2">{course.description}</p>

              <div className="flex gap-3">
                <button
                  onClick={() => handleEditCourse(course)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Edit size={18} />
                  {t.adminPanel.editCourse}
                </button>
                <button
                  onClick={() => handleDeleteCourse(course.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-100 text-red-700 py-2 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 size={18} />
                  {t.adminPanel.deleteCourse}
                </button>
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-600 text-lg">
              {t.language === 'hy' ? 'Դասեր չկան։ Ավելացրեք ձեր առաջին դասը։' : 'No courses yet. Add your first course.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
