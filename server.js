// src/grading/localGrader.ts
function gradeLocally(userAnswer, questionData) {
  const cleanUser = (userAnswer || "").toLowerCase().replace(/\s+/g, "");
  const cleanKey = (questionData.answerKey || "").toLowerCase().replace(/\s+/g, "");
  const isMatch = cleanUser.length > 0 && (cleanUser.includes(cleanKey) || cleanKey.includes(cleanUser) || (cleanKey.match(/-?\d+(\.\d+)?/g) || []).some((num) => cleanUser.includes(num)));
  return {
    score: isMatch ? 1 : 0,
    isCorrect: isMatch,
    aiFeedback: isMatch ? "Ch\u1EA5m \u0111i\u1EC3m offline: \u0110\xE1p s\u1ED1 ho\u1EB7c c\xE1ch l\xE0m c\u1EE7a b\u1EA1n kh\u1EDBp v\u1EDBi \u0111\xE1p \xE1n chu\u1EA9n. \u0110\u1EA1t 1 \u0111i\u1EC3m t\u1ED1i \u0111a!" : `Ch\u1EA5m \u0111i\u1EC3m offline: \u0110\xE1p \xE1n b\u1EA1n nh\u1EADp ch\u01B0a kh\u1EDBp v\u1EDBi \u0111\xE1p \xE1n chu\u1EA9n (${questionData.answerKey}). H\xE3y xem l\u1EA1i l\u1EDDi gi\u1EA3i chi ti\u1EBFt b\xEAn d\u01B0\u1EDBi.`,
    skillsIdentified: [questionData.topic]
  };
}

// server.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
var questionsData = [
  {
    id: 1,
    title: "C\xE2u 1 \u2014 Ti\u1EBFp tuy\u1EBFn c\u1EE7a \u0111\u01B0\u1EDDng cong \u1EA9n",
    topic: "Implicit differentiation + tangent",
    part: "Ph\u1EA7n I (1-10)",
    statement: "Cho \u0111\u01B0\u1EDDng cong x\xE1c \u0111\u1ECBnh b\u1EDFi: $x^2 + xy + y^2 = 7$. T\xECm ph\u01B0\u01A1ng tr\xECnh ti\u1EBFp tuy\u1EBFn c\u1EE7a \u0111\u01B0\u1EDDng cong t\u1EA1i \u0111i\u1EC3m $P = (2, 1)$.",
    solution: "L\u1EA5y \u0111\u1EA1o h\xE0m hai v\u1EBF theo $x$: $2x + \\frac{d}{dx}(xy) + 2yy' = 0$. V\xEC $\\frac{d}{dx}(xy) = xy' + y$, n\xEAn $2x + xy' + y + 2yy' = 0$. Nh\xF3m c\xE1c s\u1ED1 h\u1EA1ng ch\u1EE9a $y'$: $(x + 2y)y' = -(2x + y) \\implies y' = -\\frac{2x + y}{x + 2y}$. T\u1EA1i $P(2,1)$: $m = y'(2,1) = -\\frac{4+1}{2+2} = -\\frac{5}{4}$. Ph\u01B0\u01A1ng tr\xECnh ti\u1EBFp tuy\u1EBFn: $y - 1 = -\\frac{5}{4}(x - 2) \\implies y = -\\frac{5}{4}x + \\frac{7}{2}$.",
    answerKey: "y = -\\frac{5}{4}x + \\frac{7}{2}",
    hints: ["Implicit differentiation", "Derivative of product xy", "Point-slope form y - y0 = m(x - x0)"],
    detailedHint: "1. L\u1EA5y \u0111\u1EA1o h\xE0m hai v\u1EBF theo x, nh\u1EDB quy t\u1EAFc t\xEDch cho s\u1ED1 h\u1EA1ng xy: d/dx(xy) = xy' + y.\n2. Gom c\xE1c s\u1ED1 h\u1EA1ng ch\u1EE9a y' v\u1EC1 m\u1ED9t v\u1EBF \u0111\u1EC3 r\xFAt ra bi\u1EC3u th\u1EE9c y'.\n3. Thay t\u1ECDa \u0111\u1ED9 \u0111i\u1EC3m P(2,1) v\xE0o y' \u0111\u1EC3 t\xEDnh h\u1EC7 s\u1ED1 g\xF3c m.\n4. D\xF9ng ph\u01B0\u01A1ng tr\xECnh ti\u1EBFp tuy\u1EBFn: y - y0 = m(x - x0)."
  },
  {
    id: 2,
    title: "C\xE2u 2 \u2014 X\u1EA5p x\u1EC9 t\xEDch ph\xE2n b\u1EB1ng Composite Trapezoidal Rule",
    topic: "Composite Trapezoidal Rule",
    part: "Ph\u1EA7n I (1-10)",
    statement: "Cho b\u1EA3ng gi\xE1 tr\u1ECB:\n$x$: 0 | 1 | 2 | 3 | 4\n$f(x)$: 2 | 4 | 5 | 8 | 9\nD\xF9ng Composite Trapezoidal Rule \u0111\u1EC3 x\u1EA5p x\u1EC9 $\\int_0^4 f(x) dx$.",
    solution: "Kho\u1EA3ng c\xE1ch gi\u1EEFa hai \u0111i\u1EC3m li\xEAn ti\u1EBFp $h = 1$. C\xF4ng th\u1EE9c h\xECnh thang t\u1ED5ng h\u1EE3p: $T_n = \\frac{h}{2}[f_0 + 2f_1 + 2f_2 + \\dots + 2f_{n-1} + f_n]$. $T_4 = \\frac{1}{2}[2 + 2(4) + 2(5) + 2(8) + 9] = \\frac{1}{2}(45) = 22.5$.",
    answerKey: "22.5",
    hints: ["Composite Trapezoidal Rule formula", "h/2 * [f0 + 2f1 + 2f2 + 2f3 + f4]"],
    detailedHint: "1. X\xE1c \u0111\u1ECBnh b\u01B0\u1EDBc nh\u1EA3y h gi\u1EEFa c\xE1c \u0111i\u1EC3m x: h = 1.\n2. \xC1p d\u1EE5ng c\xF4ng th\u1EE9c h\xECnh thang t\u1ED5ng h\u1EE3p: T_n = (h/2) * [f0 + 2f1 + 2f2 + 2f3 + f4].\n3. Nh\xE2n \u0111\xF4i t\u1EA5t c\u1EA3 c\xE1c gi\xE1 tr\u1ECB f(x) \u1EDF gi\u1EEFa v\xE0 c\u1ED9ng v\u1EDBi bi\xEAn f0, f4 r\u1ED3i nh\xE2n v\u1EDBi h/2."
  },
  {
    id: 3,
    title: "C\xE2u 3 \u2014 \u0110\u1EA1o h\xE0m c\u1EE7a h\xE0m \u1EA9n",
    topic: "Implicit differentiation",
    part: "Ph\u1EA7n I (1-10)",
    statement: "Cho: $x^3 + y^3 = 9xy$. T\xECm $\\frac{dy}{dx}$.",
    solution: "L\u1EA5y \u0111\u1EA1o h\xE0m hai v\u1EBF: $3x^2 + 3y^2 y' = 9(xy)' = 9(xy' + y)$. Chuy\u1EC3n v\u1EBF v\xE0 \u0111\u1EB7t $y'$ ra ngo\xE0i: $(3y^2 - 9x)y' = 9y - 3x^2 \\implies \\frac{dy}{dx} = \\frac{3y - x^2}{y^2 - 3x}$.",
    answerKey: "\\frac{3y - x^2}{y^2 - 3x}",
    hints: ["Differentiate both sides with respect to x", "Product rule for xy"],
    detailedHint: "1. \u0110\u1EA1o h\xE0m theo x t\u1EEBng s\u1ED1 h\u1EA1ng: (x^3)' = 3x^2, (y^3)' = 3y^2 y', (9xy)' = 9(xy' + y).\n2. Gom c\xE1c s\u1ED1 h\u1EA1ng c\xF3 ch\u1EE9a y' v\u1EC1 v\u1EBF tr\xE1i, c\xE1c s\u1ED1 h\u1EA1ng c\xF2n l\u1EA1i v\u1EC1 v\u1EBF ph\u1EA3i.\n3. \u0110\u1EB7t y' ra ngo\xE0i l\xE0m nh\xE2n t\u1EED chung v\xE0 chia h\u1EC7 s\u1ED1 \u0111\u1EC3 thu \u0111\u01B0\u1EE3c dy/dx."
  },
  {
    id: 4,
    title: "C\xE2u 4 \u2014 Related Rates",
    topic: "Related Rates (\u0111\u1EA1o h\xE0m theo t)",
    part: "Ph\u1EA7n I (1-10)",
    statement: "M\u1ED9t chi\u1EBFc thang d\xE0i 13 m t\u1EF1a v\xE0o t\u01B0\u1EDDng. \u0110\u1EA7u d\u01B0\u1EDBi c\u1EE7a thang tr\u01B0\u1EE3t ra xa t\u01B0\u1EDDng v\u1EDBi t\u1ED1c \u0111\u1ED9 $\\frac{dx}{dt} = 3$ m/s. T\u1EA1i th\u1EDDi \u0111i\u1EC3m $x = 5$ m, t\xECm t\u1ED1c \u0111\u1ED9 chuy\u1EC3n \u0111\u1ED9ng c\u1EE7a \u0111\u1EA7u tr\xEAn c\u1EE7a thang.",
    solution: "G\u1ECDi $x$ l\xE0 kho\u1EA3ng c\xE1ch ch\xE2n thang, $y$ l\xE0 \u0111\u1ED9 cao \u0111\u1EA7u thang. Theo \u0111\u1ECBnh l\xFD Pythagore: $x^2 + y^2 = 13^2 = 169$. L\u1EA5y \u0111\u1EA1o h\xE0m theo $t$: $2x \\frac{dx}{dt} + 2y \\frac{dy}{dt} = 0 \\implies x \\frac{dx}{dt} + y \\frac{dy}{dt} = 0$. Khi $x = 5$, $5^2 + y^2 = 169 \\implies y = 12$. Thay v\xE0o: $5(3) + 12 \\frac{dy}{dt} = 0 \\implies \\frac{dy}{dt} = -\\frac{15}{12} = -\\frac{5}{4}$ m/s (tr\u01B0\u1EE3t xu\u1ED1ng t\u1ED1c \u0111\u1ED9 $\\frac{5}{4}$ m/s).",
    answerKey: "-\\frac{5}{4}",
    hints: ["Pythagorean theorem x^2 + y^2 = 13^2", "Differentiate with respect to time t"],
    detailedHint: "1. L\u1EADp quan h\u1EC7 h\xECnh h\u1ECDc: x^2 + y^2 = 13^2.\n2. L\u1EA5y \u0111\u1EA1o h\xE0m hai v\u1EBF theo th\u1EDDi gian t: 2x(dx/dt) + 2y(dy/dt) = 0.\n3. Thay x = 5 v\xE0o \u0111\u1ECBnh l\xFD Pythagore \u0111\u1EC3 t\xECm y = 12.\n4. Thay dx/dt = 3, x = 5, y = 12 v\xE0o ph\u01B0\u01A1ng tr\xECnh \u0111\u1EA1o h\xE0m \u0111\u1EC3 t\xECm dy/dt."
  },
  {
    id: 5,
    title: "C\xE2u 5 \u2014 Newton Method",
    topic: "Newton's Method",
    part: "Ph\u1EA7n I (1-10)",
    statement: "D\xF9ng ph\u01B0\u01A1ng ph\xE1p Newton \u0111\u1EC3 t\xECm nghi\u1EC7m x\u1EA5p x\u1EC9 c\u1EE7a $f(x) = x^3 - 2x - 2 = 0$. Bi\u1EBFt $x_1 = 2$. T\xEDnh $x_2$ v\xE0 $x_3$.",
    solution: "C\xF4ng th\u1EE9c Newton: $x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}$. Ta c\xF3 $f'(x) = 3x^2 - 2$. B\u01B0\u1EDBc 1: $x_1 = 2 \\implies f(2) = 2, f'(2) = 10 \\implies x_2 = 2 - \\frac{2}{10} = 1.8$. B\u01B0\u1EDBc 2: $f(1.8) = 0.232, f'(1.8) = 7.72 \\implies x_3 = 1.8 - \\frac{0.232}{7.72} \\approx 1.76995$.",
    answerKey: "x_2 = 1.8, x_3 = 1.76995",
    hints: ["Newton formula x_{n+1} = x_n - f(x_n)/f'(x_n)", "Derivative f'(x) = 3x^2 - 2"],
    detailedHint: "1. T\xEDnh \u0111\u1EA1o h\xE0m f'(x) = 3x^2 - 2.\n2. \xC1p d\u1EE5ng c\xF4ng th\u1EE9c l\u1EB7p x_{n+1} = x_n - f(x_n)/f'(x_n).\n3. T\xEDnh x2 t\u1EEB x1 = 2.\n4. D\xF9ng x2 = 1.8 \u0111\u1EC3 t\xEDnh ti\u1EBFp x3."
  },
  {
    id: 6,
    title: "C\xE2u 6 \u2014 T\xEDnh \u0111\u1ECBnh th\u1EE9c c\u1EE7a ma tr\u1EADn",
    topic: "Cofactor expansion determinant",
    part: "Ph\u1EA7n I (1-10)",
    statement: "Cho $A = \\begin{pmatrix} 1 & 2 & 3 \\\\ 0 & 5 & 1 \\\\ 2 & 0 & 4 \\end{pmatrix}$. T\xEDnh $\\det(A)$.",
    solution: "Khai tri\u1EC3n theo h\xE0ng \u0111\u1EA7u: $\\det(A) = 1\\begin{vmatrix} 5 & 1 \\\\ 0 & 4 \\end{vmatrix} - 2\\begin{vmatrix} 0 & 1 \\\\ 2 & 4 \\end{vmatrix} + 3\\begin{vmatrix} 0 & 5 \\\\ 2 & 0 \\end{vmatrix} = 1(20) - 2(-2) + 3(-10) = 20 + 4 - 30 = -6$.",
    answerKey: "-6",
    hints: ["Expand along the first row", "2x2 determinant calculation"],
    detailedHint: "1. Khai tri\u1EC3n theo h\xE0ng 1 v\u1EDBi d\u1EA5u \u0111an xen (+, -, +).\n2. T\xEDnh \u0111\u1ECBnh th\u1EE9c c\xE1c ma tr\u1EADn con c\u1EA5p 2 ad - bc.\n3. T\u1ED5ng h\u1EE3p l\u1EA1i \u0111\u1EC3 ra k\u1EBFt qu\u1EA3 det(A)."
  },
  {
    id: 7,
    title: "C\xE2u 7 \u2014 M\u1ED9t entry c\u1EE7a ma tr\u1EADn ngh\u1ECBch \u0111\u1EA3o",
    topic: "Inverse matrix entry (Cofactor / det)",
    part: "Ph\u1EA7n I (1-10)",
    statement: "Cho $A = \\begin{pmatrix} 2 & 1 & 0 \\\\ 0 & 1 & 2 \\\\ 1 & 0 & 1 \\end{pmatrix}$. T\xECm entry $(A^{-1})_{23}$.",
    solution: "C\xF4ng th\u1EE9c $(A^{-1})_{ij} = \\frac{C_{ji}}{\\det(A)}$. C\u1EA7n $(A^{-1})_{23}$ ta t\xEDnh $C_{32}$. Tr\u01B0\u1EDBc h\u1EBFt $\\det(A) = 2(1) - 1(0 - 2) = 4$. X\xF3a h\xE0ng 3 c\u1ED9t 2: $M_{32} = \\begin{vmatrix} 2 & 0 \\\\ 0 & 2 \\end{vmatrix} = 4 \\implies C_{32} = (-1)^{3+2}M_{32} = -4$. Do \u0111\xF3 $(A^{-1})_{23} = \\frac{-4}{4} = -1$.",
    answerKey: "-1",
    hints: ["Formula (A^{-1})_{ij} = C_{ji} / det(A)", "Cofactor C_{32} and det(A)"],
    detailedHint: "1. Nh\u1EDB c\xF4ng th\u1EE9c (A^{-1})_{ij} = C_{ji} / det(A).\n2. \u0110\u1EC3 t\xECm v\u1ECB tr\xED (2,3), c\u1EA7n t\xEDnh cofactor C_{32}.\n3. T\xEDnh det(A) v\xE0 \u0111\u1ECBnh th\u1EE9c con M_{32} sau khi x\xF3a h\xE0ng 3 c\u1ED9t 2."
  },
  {
    id: 8,
    title: "C\xE2u 8 \u2014 Gaussian Elimination v\xE0 h\u1EA1ng ma tr\u1EADn",
    topic: "Gaussian Elimination & Rank",
    part: "Ph\u1EA7n I (1-10)",
    statement: "Cho $A = \\begin{pmatrix} 1 & 2 & 3 \\\\ 2 & 4 & 6 \\\\ 1 & 3 & 4 \\end{pmatrix}$. D\xF9ng Gaussian Elimination \u0111\u1EC3 x\xE1c \u0111\u1ECBnh $\\text{rank}(A)$.",
    solution: "Th\u1EF1c hi\u1EC7n $R_2 \\leftarrow R_2 - 2R_1, R_3 \\leftarrow R_3 - R_1 \\implies \\begin{pmatrix} 1 & 2 & 3 \\\\ 0 & 0 & 0 \\\\ 0 & 1 & 1 \\end{pmatrix}$. \u0110\u1ED5i $R_2$ v\xE0 $R_3$: $\\begin{pmatrix} 1 & 2 & 3 \\\\ 0 & 1 & 1 \\\\ 0 & 0 & 0 \\end{pmatrix}$. C\xF3 2 h\xE0ng kh\xE1c kh\xF4ng $\\implies \\text{rank}(A) = 2$.",
    answerKey: "2",
    hints: ["Row operations", "Number of non-zero rows / pivots"],
    detailedHint: "1. Kh\u1EED c\xE1c ph\u1EA7n t\u1EED d\u01B0\u1EDBi ph\u1EA7n t\u1EED c\u01A1 s\u1EDF b\u1EB1ng ph\xE9p bi\u1EBFn \u0111\u1ED5i h\xE0ng.\n2. \u0110\u01B0a v\u1EC1 ma tr\u1EADn b\u1EADc thang (REF).\n3. \u0110\u1EBFm s\u1ED1 h\xE0ng kh\xE1c kh\xF4ng ch\xEDnh l\xE0 h\u1EA1ng rank(A)."
  },
  {
    id: 9,
    title: "C\xE2u 9 \u2014 M\u1ED9t entry c\u1EE7a t\xEDch hai ma tr\u1EADn",
    topic: "Matrix product row x column",
    part: "Ph\u1EA7n I (1-10)",
    statement: "Cho $A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 0 \\\\ 2 & 1 \\end{pmatrix}, B = \\begin{pmatrix} 2 & 1 & 0 & 3 \\\\ 1 & 2 & 4 & 0 \\end{pmatrix}$. \u0110\u1EB7t $C = AB$. T\xEDnh entry $C_{32}$.",
    solution: "$C_{ij} = \\text{h\xE0ng } i \\text{ c\u1EE7a } A \\cdot \\text{c\u1ED9t } j \\text{ c\u1EE7a } B$. H\xE0ng 3 c\u1EE7a $A$: $(2, 1)$. C\u1ED9t 2 c\u1EE7a $B$: $(1, 2)^T$. Do \u0111\xF3 $C_{32} = 2(1) + 1(2) = 4$.",
    answerKey: "4",
    hints: ["Row 3 of A multiplied by column 2 of B", "Dot product"],
    detailedHint: "1. Entry C_{32} l\xE0 t\xEDch v\xF4 h\u01B0\u1EDBng c\u1EE7a h\xE0ng 3 ma tr\u1EADn A v\xE0 c\u1ED9t 2 ma tr\u1EADn B.\n2. L\u1EA5y t\u1EEBng ph\u1EA7n t\u1EED t\u01B0\u01A1ng \u1EE9ng nh\xE2n v\u1EDBi nhau r\u1ED3i c\u1ED9ng l\u1EA1i."
  },
  {
    id: 10,
    title: "C\xE2u 10 \u2014 T\xEDnh \u0111\u1ECBnh th\u1EE9c t\u1EEB \u0111\u1ECBnh th\u1EE9c \u0111\xE3 bi\u1EBFt",
    topic: "Determinant of inverse matrix",
    part: "Ph\u1EA7n I (1-10)",
    statement: "Cho $A$ l\xE0 ma tr\u1EADn vu\xF4ng c\u1EA5p 3 v\xE0 $\\det(A) = -3$. T\xEDnh $\\det(A^{-1})$.",
    solution: "T\xEDnh ch\u1EA5t: $\\det(A^{-1}) = \\frac{1}{\\det(A)} = \\frac{1}{-3} = -\\frac{1}{3}$.",
    answerKey: "-\\frac{1}{3}",
    hints: ["det(A^{-1}) = 1 / det(A)"],
    detailedHint: "S\u1EED d\u1EE5ng t\xEDnh ch\u1EA5t \u0111\u1ECBnh th\u1EE9c c\u1EE7a ma tr\u1EADn ngh\u1ECBch \u0111\u1EA3o: det(A^{-1}) = 1 / det(A)."
  },
  {
    id: 11,
    title: "C\xE2u 11 \u2014 \u0110\u1EA1o h\xE0m c\u1EE7a t\xEDch ph\xE2n c\xF3 c\u1EADn tham s\u1ED1",
    topic: "Leibniz Rule for parameter integrals",
    part: "Ph\u1EA7n II (11-20)",
    statement: "Cho $F(x) = \\int_{x}^{x^2} (t^2 + 1) dt$. T\xEDnh $F'(x)$.",
    solution: "S\u1EED d\u1EE5ng c\xF4ng th\u1EE9c Leibniz: $\\frac{d}{dx}\\int_{a(x)}^{b(x)} f(t)dt = f(b(x))b'(x) - f(a(x))a'(x)$. $F'(x) = ((x^2)^2 + 1)(2x) - (x^2 + 1)(1) = 2x(x^4 + 1) - (x^2 + 1) = 2x^5 - x^2 + 2x - 1$.",
    answerKey: "2x^5 - x^2 + 2x - 1",
    hints: ["Leibniz integral rule", "Substitute upper and lower limits and multiply by their derivatives"],
    detailedHint: "\xC1p d\u1EE5ng c\xF4ng th\u1EE9c Leibniz: thay c\u1EADn tr\xEAn v\xE0o h\xE0m d\u01B0\u1EDBi d\u1EA5u t\xEDch ph\xE2n nh\xE2n v\u1EDBi \u0111\u1EA1o h\xE0m c\u1EADn tr\xEAn, tr\u1EEB \u0111i thay c\u1EADn d\u01B0\u1EDBi nh\xE2n \u0111\u1EA1o h\xE0m c\u1EADn d\u01B0\u1EDBi."
  },
  {
    id: 12,
    title: "C\xE2u 12 \u2014 T\xEDnh t\xEDch ph\xE2n b\u1EB1ng Simpson's Rule",
    topic: "Composite Simpson's Rule",
    part: "Ph\u1EA7n II (11-20)",
    statement: "Cho b\u1EA3ng gi\xE1 tr\u1ECB:\n$x$: 0 | 1 | 2 | 3 | 4\n$f(x)$: 1 | 4 | 2 | 5 | 3\nD\xF9ng Composite Simpson's Rule \u0111\u1EC3 x\u1EA5p x\u1EC9 $\\int_0^4 f(x) dx$.",
    solution: "$n = 4$ (ch\u1EB5n), $h = 1$. C\xF4ng th\u1EE9c Simpson: $S_n = \\frac{h}{3}[f_0 + f_n + 4(f_1 + f_3) + 2f_2]$. $S_4 = \\frac{1}{3}[1 + 3 + 4(4 + 5) + 2(2)] = \\frac{1}{3}[4 + 36 + 4] = \\frac{44}{3} \\approx 14.667$.",
    answerKey: "\\frac{44}{3}",
    hints: ["Simpson's rule h/3 * [f0 + 4f1 + 2f2 + 4f3 + f4]"],
    detailedHint: "\xC1p d\u1EE5ng c\xF4ng th\u1EE9c Simpson t\u1ED5ng h\u1EE3p v\u1EDBi n=4 ch\u1EB5n: S_4 = (h/3) * [f0 + f4 + 4(f1 + f3) + 2f2]."
  },
  {
    id: 13,
    title: "C\xE2u 13a & 13b \u2014 Displacement vs Total Distance",
    topic: "Displacement and Total Distance",
    part: "Ph\u1EA7n II (11-20)",
    statement: "M\u1ED9t v\u1EADt chuy\u1EC3n \u0111\u1ED9ng v\u1EDBi v\u1EADn t\u1ED1c $v(t) = 3t^2 - 4t + 1, 0 \\le t \\le 2$. (a) T\xEDnh displacement trong kho\u1EA3ng t\u1EEB $t=0$ \u0111\u1EBFn $t=2$. (b) T\xEDnh total distance m\xE0 v\u1EADt \u0111\xE3 \u0111i \u0111\u01B0\u1EE3c.",
    solution: "(a) Displacement = $\\int_0^2 (3t^2 - 4t + 1) dt = [t^3 - 2t^2 + t]_0^2 = (8 - 8 + 2) - 0 = 2$. (b) Distance = $\\int_0^2 |3t^2 - 4t + 1| dt$. Ph\xE2n t\xEDch $3t^2 - 4t + 1 = (3t-1)(t-1)$, nghi\u1EC7m $t = 1/3, t = 1$. Chia t\xEDch ph\xE2n tr\xEAn c\xE1c kho\u1EA3ng d\u1EA5u d\u01B0\u01A1ng \xE2m: $D = \\int_0^{1/3} v dt - \\int_{1/3}^1 v dt + \\int_1^2 v dt = \\frac{4}{27} + \\frac{4}{27} + 2 = \\frac{62}{27}$.",
    answerKey: "\\text{Displacement} = 2, \\text{Distance} = \\frac{62}{27}",
    hints: ["Displacement is integral of v(t)", "Distance is integral of |v(t)| (split by roots)"],
    detailedHint: "1. Displacement l\xE0 t\xEDch ph\xE2n tr\u1EF1c ti\u1EBFp c\u1EE7a v(t).\n2. Total distance l\xE0 t\xEDch ph\xE2n tr\u1ECB tuy\u1EC7t \u0111\u1ED1i |v(t)|, c\u1EA7n t\xECm nghi\u1EC7m c\u1EE7a v(t) \u0111\u1EC3 t\xE1ch kho\u1EA3ng t\xEDch ph\xE2n."
  },
  {
    id: 14,
    title: "C\xE2u 14 \u2014 H\u1ED9i t\u1EE5 c\u1EE7a t\xEDch ph\xE2n suy r\u1ED9ng b\u1EB1ng ph\u01B0\u01A1ng ph\xE1p so s\xE1nh",
    topic: "Improper integral Comparison Test",
    part: "Ph\u1EA7n II (11-20)",
    statement: "X\xE9t t\xEDch ph\xE2n suy r\u1ED9ng $\\int_1^\\infty \\frac{1}{x^2 + x} dx$. S\u1EED d\u1EE5ng ph\u01B0\u01A1ng ph\xE1p so s\xE1nh \u0111\u1EC3 x\xE1c \u0111\u1ECBnh t\xEDch ph\xE2n h\u1ED9i t\u1EE5 hay ph\xE2n k\u1EF3.",
    solution: "V\u1EDBi $x \\ge 1$, $x^2 + x > x^2 \\implies \\frac{1}{x^2+x} < \\frac{1}{x^2}$. V\xEC $\\int_1^\\infty \\frac{1}{x^2}dx$ h\u1ED9i t\u1EE5 (p-type v\u1EDBi $p = 2 > 1$), n\xEAn theo Comparison Test, t\xEDch ph\xE2n \u0111\xE3 cho h\u1ED9i t\u1EE5.",
    answerKey: "\\text{H\u1ED9i t\u1EE5 (Convergent)}",
    hints: ["Comparison test with 1/x^2", "p-integral convergence (p > 1)"],
    detailedHint: "\u0110\xE1nh gi\xE1 m\u1EABu s\u1ED1 l\u1EDBn h\u01A1n x^2 \u0111\u1EC3 suy ra ph\xE2n th\u1EE9c nh\u1ECF h\u01A1n 1/x^2. K\u1EBFt h\u1EE3p v\u1EDBi t\xEDnh h\u1ED9i t\u1EE5 c\u1EE7a t\xEDch ph\xE2n p-type (p=2 > 1)."
  },
  {
    id: 15,
    title: "C\xE2u 15 \u2014 \u0110\u1EA1o h\xE0m c\u1EE7a h\xE0m ph\xE2n th\u1EE9c",
    topic: "Quotient Rule",
    part: "Ph\u1EA7n II (11-20)",
    statement: "Cho $f(x) = \\frac{x^2 + 1}{x - 2}$. T\xEDnh $f'(x)$.",
    solution: "S\u1EED d\u1EE5ng Quotient Rule $\\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^2}$. $u = x^2+1, v = x-2 \\implies u'=2x, v'=1$. $f'(x) = \\frac{2x(x-2) - (x^2+1)(1)}{(x-2)^2} = \\frac{2x^2 - 4x - x^2 - 1}{(x-2)^2} = \\frac{x^2 - 4x - 1}{(x-2)^2}$.",
    answerKey: "\\frac{x^2 - 4x - 1}{(x-2)^2}",
    hints: ["Quotient rule formula (u'v - uv') / v^2"],
    detailedHint: "\xC1p d\u1EE5ng quy t\u1EAFc \u0111\u1EA1o h\xE0m th\u01B0\u01A1ng s\u1ED1: (u/v)' = (u'v - uv') / v^2."
  },
  {
    id: 16,
    title: "C\xE2u 16 \u2014 T\xEDnh \u0111\u1ECBnh th\u1EE9c c\xF3 ch\u1EE9a tham s\u1ED1 b\u1EB1ng t\xEDnh ch\u1EA5t c\u1EE7a \u0111\u1ECBnh th\u1EE9c",
    topic: "Determinant with parameter & row operations",
    part: "Ph\u1EA7n II (11-20)",
    statement: "Cho $D = \\begin{vmatrix} a & 1 & 1 \\\\ 1 & a & 1 \\\\ 1 & 1 & a \\end{vmatrix}$. T\xEDnh $D$ b\u1EB1ng c\xE1ch s\u1EED d\u1EE5ng c\xE1c t\xEDnh ch\u1EA5t c\u1EE7a \u0111\u1ECBnh th\u1EE9c.",
    solution: "Bi\u1EBFn \u0111\u1ED5i $R_2 \\leftarrow R_2 - R_1, R_3 \\leftarrow R_3 - R_1 \\implies \\begin{vmatrix} a & 1 & 1 \\\\ 1-a & a-1 & 0 \\\\ 1-a & 0 & a-1 \\end{vmatrix}$. \u0110\u01B0a $(a-1)$ ra kh\u1ECFi h\xE0ng 2 v\xE0 h\xE0ng 3 $\\implies D = (a-1)^2 \\begin{vmatrix} a & 1 & 1 \\\\ -1 & 1 & 0 \\\\ -1 & 0 & 1 \\end{vmatrix} = (a-1)^2(a + 2)$.",
    answerKey: "(a - 1)^2(a + 2)",
    hints: ["Row subtraction R2 - R1, R3 - R1", "Factor out (a-1)"],
    detailedHint: "Tr\u1EEB h\xE0ng 2 v\xE0 h\xE0ng 3 cho h\xE0ng 1 \u0111\u1EC3 l\xE0m xu\u1EA5t hi\u1EC7n nh\xE2n t\u1EED chung (a-1), \u0111\u01B0a ra ngo\xE0i r\u1ED3i t\xEDnh \u0111\u1ECBnh th\u1EE9c c\xF2n l\u1EA1i."
  },
  {
    id: 17,
    title: "C\xE2u 17 \u2014 Nh\u1EADn di\u1EC7n ma tr\u1EADn b\u1EADc thang v\xE0 b\u1EADc thang r\xFAt g\u1ECDn",
    topic: "REF and RREF identification",
    part: "Ph\u1EA7n II (11-20)",
    statement: "H\xE3y x\xE1c \u0111\u1ECBnh m\u1ED7i ma tr\u1EADn d\u01B0\u1EDBi \u0111\xE2y l\xE0: REF, RREF, hay kh\xF4ng ph\u1EA3i ma tr\u1EADn b\u1EADc thang:\nA = $\\begin{pmatrix} 1 & 2 & 0 \\\\ 0 & 1 & 3 \\\\ 0 & 0 & 1 \\end{pmatrix}$, B = $\\begin{pmatrix} 1 & 0 & 2 \\\\ 0 & 1 & -1 \\\\ 0 & 0 & 0 \\end{pmatrix}$, C = $\\begin{pmatrix} 1 & 2 \\\\ 0 & 0 \\end{pmatrix}$, D = $\\begin{pmatrix} 1 & 0 & 1 \\\\ 0 & 0 & 0 \\\\ 0 & 1 & 2 \\end{pmatrix}$.",
    solution: "A: REF (pivots move right, zero rows at bottom, but elements above pivots are not 0 -> not RREF). B: RREF (pivots are 1, only non-zero in pivot columns). C: RREF. D: Kh\xF4ng ph\u1EA3i REF (h\xE0ng 0 xu\u1EA5t hi\u1EC7n tr\u01B0\u1EDBc h\xE0ng kh\xE1c kh\xF4ng).",
    answerKey: "A: REF, B: RREF, C: RREF, D: Kh\xF4ng ph\u1EA3i REF",
    hints: ["Check pivot positions and zeros above/below pivots"],
    detailedHint: "Ki\u1EC3m tra \u0111\u1ECBnh ngh\u0129a REF (h\xE0ng kh\xF4ng n\u1EB1m d\u01B0\u1EDBi, pivot d\u1ECBch ph\u1EA3i) v\xE0 RREF (pivot b\u1EB1ng 1 v\xE0 c\xE1c ph\u1EA7n t\u1EED tr\xEAn/d\u01B0\u1EDBi c\u1ED9t pivot \u0111\u1EC1u b\u1EB1ng 0)."
  },
  {
    id: 18,
    title: "C\xE2u 18 \u2014 X\xE1c \u0111\u1ECBnh h\u1EC7 vect\u01A1 \u0111\u1ED9c l\u1EADp hay ph\u1EE5 thu\u1ED9c tuy\u1EBFn t\xEDnh",
    topic: "Linear independence & dependence",
    part: "Ph\u1EA7n II (11-20)",
    statement: "X\xE1c \u0111\u1ECBnh t\xEDnh \u0111\u1ED9c l\u1EADp/ph\u1EE5 thu\u1ED9c tuy\u1EBFn t\xEDnh cho:\n(a) Ba vect\u01A1 trong $\\mathbb{R}^3$: $v_1 = (1,0,2)^T, v_2 = (0,1,1)^T, v_3 = (2,1,0)^T$.\n(b) 4 vect\u01A1 trong $\\mathbb{R}^3$.\n(c) Hai vect\u01A1 $v_1 = (1,0,1)^T, v_2 = (0,1,1)^T$.\n(d) $v_1 = (1,2,3)^T, v_2 = (2,4,6)^T$.",
    solution: "(a) L\u1EADp ma tr\u1EADn c\xF3 $\\det(A) = -5 \\neq 0 \\implies$ \u0110\u1ED9c l\u1EADp tuy\u1EBFn t\xEDnh. (b) 4 vect\u01A1 trong $\\mathbb{R}^3$ ($4 > 3$) $\\implies$ Ph\u1EE5 thu\u1ED9c tuy\u1EBFn t\xEDnh. (c) Hai c\u1ED9t kh\xF4ng t\u1EC9 l\u1EC7, $\\text{rank}=2 \\implies$ \u0110\u1ED9c l\u1EADp tuy\u1EBFn t\xEDnh. (d) $v_2 = 2v_1 \\implies$ Ph\u1EE5 thu\u1ED9c tuy\u1EBFn t\xEDnh.",
    answerKey: "(a) \u0110\u1ED9c l\u1EADp, (b) Ph\u1EE5 thu\u1ED9c, (c) \u0110\u1ED9c l\u1EADp, (d) Ph\u1EE5 thu\u1ED9c",
    hints: ["Check determinant for square matrices", "Compare number of vectors with dimension", "Check scalar multiples"],
    detailedHint: "D\xF9ng \u0111\u1ECBnh th\u1EE9c n\u1EBFu s\u1ED1 vect\u01A1 b\u1EB1ng s\u1ED1 chi\u1EC1u; s\u1ED1 vect\u01A1 l\u1EDBn h\u01A1n s\u1ED1 chi\u1EC1u lu\xF4n ph\u1EE5 thu\u1ED9c; x\xE9t t\u1EF7 l\u1EC7 ho\u1EB7c h\u1EA1ng c\u1EE7a ma tr\u1EADn."
  },
  {
    id: 19,
    title: "C\xE2u 19 \u2014 T\xEDnh det(4A) bi\u1EBFt det(A)",
    topic: "Determinant scalar property det(kA) = k^n det(A)",
    part: "Ph\u1EA7n II (11-20)",
    statement: "Cho $A$ l\xE0 ma tr\u1EADn vu\xF4ng c\u1EA5p 4 v\xE0 $\\det(A) = 3$. T\xEDnh $\\det(4A).$",
    solution: "V\u1EDBi ma tr\u1EADn vu\xF4ng c\u1EA5p $n$: $\\det(kA) = k^n \\det(A)$. \u1EDE \u0111\xE2y $n = 4, k = 4, \\det(A) = 3 \\implies \\det(4A) = 4^4 \\cdot 3 = 256 \\cdot 3 = 768$.",
    answerKey: "768",
    hints: ["Formula det(kA) = k^n det(A)", "Here n = 4, k = 4"],
    detailedHint: "\xC1p d\u1EE5ng t\xEDnh ch\u1EA5t det(kA) = k^n det(A) v\u1EDBi n l\xE0 c\u1EA5p c\u1EE7a ma tr\u1EADn."
  },
  {
    id: 20,
    title: "C\xE2u 20 \u2014 T\xECm gi\xE1 tr\u1ECB c\u1EE7a tham s\u1ED1 \u0111\u1EC3 h\u1EC7 ph\u01B0\u01A1ng tr\xECnh tuy\u1EBFn t\xEDnh c\xF3 nghi\u1EC7m",
    topic: "Linear system consistency with parameter",
    part: "Ph\u1EA7n II (11-20)",
    statement: "T\xECm c\xE1c gi\xE1 tr\u1ECB c\u1EE7a tham s\u1ED1 $a$ \u0111\u1EC3 h\u1EC7 ph\u01B0\u01A1ng tr\xECnh $\\begin{cases} x + y + z = 1 \\\\ 2x + 2y + 2z = 2 \\\\ x + y + az = 2 \\end{cases}$ c\xF3 nghi\u1EC7m.",
    solution: "PT 2 l\xE0 2 l\u1EA7n PT 1. PT 3 tr\u1EEB PT 1: $(a-1)z = 1$. N\u1EBFu $a = 1 \\implies 0z = 1$ (v\xF4 nghi\u1EC7m). N\u1EBFu $a \\neq 1 \\implies z = \\frac{1}{a-1}$, h\u1EC7 c\xF3 nghi\u1EC7m. V\u1EADy \u0111i\u1EC1u ki\u1EC7n l\xE0 $a \\neq 1$.",
    answerKey: "a \\neq 1",
    hints: ["Subtract equations to eliminate variables", "Check consistency condition (no 0 = non-zero)"],
    detailedHint: "Kh\u1EED \u1EA9n b\u1EB1ng c\xE1ch tr\u1EEB c\xE1c ph\u01B0\u01A1ng tr\xECnh, t\xECm \u0111i\u1EC1u ki\u1EC7n c\u1EE7a tham s\u1ED1 a \u0111\u1EC3 tr\xE1nh ph\u01B0\u01A1ng tr\xECnh v\xF4 l\xFD d\u1EA1ng 0 = non-zero."
  }
];
var app = express();
app.use(express.json());
app.get("/api/questions", (req, res) => {
  res.json(questionsData);
});
app.post("/api/grade", async (req, res) => {
  try {
    const { questionId, userAnswer, questionData, aiSettings } = req.body;
    const provider = aiSettings?.provider || "gemini";
    const apiKey = aiSettings?.apiKey || process.env.GEMINI_API_KEY;
    if (provider === "offline" || !apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return res.json(gradeLocally(userAnswer, questionData));
    }
    const prompt = `You are an expert professor of Calculus and Linear Algebra (MAE101) grading student math exam answers.

CRITICAL GRADING RULES (R\u1EA4T R\u1ED8NG R\xC3I & LINH HO\u1EA0T):
- Ch\u1EC9 c\u1EA7n sinh vi\xEAn \u0111i\u1EC1n \u0111\xFAng \u0110\xC1P S\u1ED0 (final answer) HO\u1EB6C c\xE1c B\u01AF\u1EDAC L\xC0M / C\xC1CH L\u1EACP LU\u1EACN / PH\u01AF\u01A0NG PH\xC1P \u0111\xFAng, b\u1EA1n PH\u1EA2I cho \u0111i\u1EC3m t\u1ED1i \u0111a (score: 1, isCorrect: true).
- Kh\xF4ng b\u1EAFt b\u1EBB l\u1ED7i k\xFD hi\u1EC7u nh\u1ECF hay tr\xECnh b\xE0y kh\xE1c m\u1ED9t ch\xFAt n\u1EBFu b\u1EA3n ch\u1EA5t to\xE1n h\u1ECDc ch\xEDnh x\xE1c.
- Ch\u1EC9 cho 0 \u0111i\u1EC3m n\u1EBFu sinh vi\xEAn b\u1ECF tr\u1ED1ng ho\u1EB7c tr\u1EA3 l\u1EDDi ho\xE0n to\xE0n sai l\u1EC7ch b\u1EA3n ch\u1EA5t.

Question:
${questionData.statement}

Official Solution & Answer Key:
Solution: ${questionData.solution}
Correct Answer Key: ${questionData.answerKey}

Student's Submitted Answer:
${userAnswer || "(No answer provided)"}

Evaluate the student's answer according to the generous rules above. Return a JSON response with the following structure:
{
  "score": 1 or 0,
  "isCorrect": true or false,
  "aiFeedback": "Nh\u1EADn x\xE9t ng\u1EAFn g\u1ECDn, kh\xEDch l\u1EC7 v\xE0 x\xE1c nh\u1EADn t\xEDnh \u0111\xFAng \u0111\u1EAFn c\u1EE7a c\xE1ch l\xE0m ho\u1EB7c \u0111\xE1p s\u1ED1 b\u1EB1ng ti\u1EBFng Vi\u1EC7t.",
  "skillsIdentified": ["List of math skills or concepts"]
}

Return ONLY valid JSON.`;
    if (provider === "openai") {
      const openAiResp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are an expert math professor grading MAE101 exam answers in JSON format." },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" }
        })
      });
      const openAiData = await openAiResp.json();
      const content = openAiData.choices?.[0]?.message?.content || "{}";
      const parsed = JSON.parse(content);
      return res.json({
        score: parsed.score ?? (parsed.isCorrect ? 1 : 0),
        isCorrect: parsed.isCorrect ?? parsed.score === 1,
        aiFeedback: parsed.aiFeedback || "Ch\u1EA5m \u0111i\u1EC3m ho\xE0n t\u1EA5t.",
        skillsIdentified: parsed.skillsIdentified || [questionData.topic]
      });
    } else {
      const customAi = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
      });
      const response = await customAi.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const textResult = response.text || "{}";
      let parsed;
      try {
        parsed = JSON.parse(textResult);
      } catch (e) {
        const cleaned = textResult.replace(/```json/g, "").replace(/```/g, "").trim();
        parsed = JSON.parse(cleaned);
      }
      return res.json({
        score: parsed.score ?? (parsed.isCorrect ? 1 : 0),
        isCorrect: parsed.isCorrect ?? parsed.score === 1,
        aiFeedback: parsed.aiFeedback || "Ch\u1EA5m \u0111i\u1EC3m ho\xE0n t\u1EA5t.",
        skillsIdentified: parsed.skillsIdentified || [questionData.topic]
      });
    }
  } catch (error) {
    console.warn("AI grading error or offline, falling back to local grading:", error.message);
    return res.json(gradeLocally(req.body.userAnswer, req.body.questionData));
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }
  const port = process.env.PORT || 3e3;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}
startServer();
export {
  questionsData
};
