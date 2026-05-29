const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf-8');

const target1 = `{activeTab === 'Playground' && (
             <div className="w-full h-[calc(100vh-120px)] relative z-10">
               <Playground />
             </div>
           )}`;
const target2 = `{activeTab === 'Playground' && (
              <div className="w-full h-[calc(100vh-120px)] relative z-10">
                <Playground />
              </div>
            )}`;

let found = false;
if (content.includes(target1)) {
  content = content.replace(target1, target1 + `\n           {activeTab === 'Courses' && (
             <div className="w-full h-[calc(100vh-120px)] relative z-10">
               <CourseHub />
             </div>
           )}`);
  found = true;
} else if (content.includes(target2)) {
  content = content.replace(target2, target2 + `\n           {activeTab === 'Courses' && (
             <div className="w-full h-[calc(100vh-120px)] relative z-10">
               <CourseHub />
             </div>
           )}`);
  found = true;
}

if (!found) {
  // If exact whitespace matching failed, let's just insert it before `<Sec>Linear Kanban</Sec>` which comes right after Tracker
  const fallbackTarget = `{activeTab === 'Tracker' && (<>`;
  content = content.replace(fallbackTarget, `{activeTab === 'Courses' && (
             <div className="w-full h-[calc(100vh-120px)] relative z-10">
               <CourseHub />
             </div>
           )}\n           ` + fallbackTarget);
}

fs.writeFileSync('App.tsx', content, 'utf-8');
console.log('App.tsx updated');
