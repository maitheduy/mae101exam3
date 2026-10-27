export function gradeLocally(userAnswer: string, questionData: any) {
  const cleanUser = (userAnswer || "").toLowerCase().replace(/\s+/g, '');
  const cleanKey = (questionData.answerKey || "").toLowerCase().replace(/\s+/g, '');
  
  const isMatch = cleanUser.length > 0 && (
    cleanUser.includes(cleanKey) || 
    cleanKey.includes(cleanUser) ||
    (cleanKey.match(/-?\d+(\.\d+)?/g) || []).some((num: string) => cleanUser.includes(num))
  );

  return {
    score: isMatch ? 1 : 0,
    isCorrect: isMatch,
    aiFeedback: isMatch 
      ? "Chấm điểm offline: Đáp số hoặc cách làm của bạn khớp với đáp án chuẩn. Đạt 1 điểm tối đa!" 
      : `Chấm điểm offline: Đáp án bạn nhập chưa khớp với đáp án chuẩn (${questionData.answerKey}). Hãy xem lại lời giải chi tiết bên dưới.`,
    skillsIdentified: [questionData.topic]
  };
}
