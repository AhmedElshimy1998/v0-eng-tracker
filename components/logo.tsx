import React from 'react';

export function Logo({ className = "w-40 h-auto" }: { className?: string }) {
  return (
      <svg 
            xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 400 400" 
                        className={className}
                            >
                                  <defs>
                                          {/* الماسك ده عشان نفرغ الدائرة اللي في النص بدقة */}
                                                  <mask id="gear-mask">
                                                            <rect width="400" height="400" fill="white" />
                                                                      <circle cx="200" cy="150" r="60" fill="black" />
                                                                              </mask>
                                                                                    </defs>

                                                                                          {/* 1. الترس ومؤشر الموقع (اللون الكحلي) */}
                                                                                                <g mask="url(#gear-mask)" fill="#061c2f">
                                                                                                        {/* الدائرة الأساسية للترس */}
                                                                                                                <circle cx="200" cy="150" r="85" />
                                                                                                                        
                                                                                                                                {/* الجزء السفلي (مؤشر الموقع) */}
                                                                                                                                        <path d="M 125 185 L 200 290 L 275 185 Z" />
                                                                                                                                                
                                                                                                                                                        {/* أسنان الترس (الـ 5 أسنان العلوية والجانبية) */}
                                                                                                                                                                <rect x="180" y="45" width="40" height="30" rx="4" /> {/* فوق */}
                                                                                                                                                                        <rect x="180" y="45" width="40" height="30" rx="4" transform="rotate(45 200 150)" /> {/* يمين فوق */}
                                                                                                                                                                                <rect x="180" y="45" width="40" height="30" rx="4" transform="rotate(90 200 150)" /> {/* يمين */}
                                                                                                                                                                                        <rect x="180" y="45" width="40" height="30" rx="4" transform="rotate(-45 200 150)" /> {/* شمال فوق */}
                                                                                                                                                                                                <rect x="180" y="45" width="40" height="30" rx="4" transform="rotate(-90 200 150)" /> {/* شمال */}
                                                                                                                                                                                                      </g>

                                                                                                                                                                                                            {/* 2. الساعة (اللون السماوي/السيان) */}
                                                                                                                                                                                                                  <g stroke="#00d
                                                                                                                                                                                                                  