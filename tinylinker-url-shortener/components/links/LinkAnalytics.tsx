
import React, { useMemo } from 'react';
import { Link as LinkType } from '../../types';
import Card from '../ui/Card';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Colors } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Colors);

interface LinkAnalyticsProps {
  link: LinkType;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }[];
}

const chartOptionsBase: any = { // Use 'any' for options to easily add rtl specific if needed later
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        font: {
          size: 10,
        },
        padding:10,
      }
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += context.parsed.y;
          }
          return label;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0 // Ensure y-axis shows whole numbers for clicks
      }
    },
    x: {
        ticks: {
            font: {
                size: 10
            }
        }
    }
  }
};


const LinkAnalytics: React.FC<LinkAnalyticsProps> = ({ link }) => {
  const totalClicks = link.clicks.length;

  const clicksByTargetData = useMemo((): ChartData | null => {
    const targetMap: { [key: string]: { name: string, clicks: number } } = {};
    (link.targetValues || []).forEach(tv => {
      targetMap[tv.value] = { name: tv.name, clicks: 0 };
    });
    
    let untargetedClicks = 0;
    link.clicks.forEach(click => {
      if (click.targetParamValue && targetMap[click.targetParamValue]) {
        targetMap[click.targetParamValue].clicks++;
      } else if (click.targetParamValue) { // Target value exists but not in predefined targetValues
        const otherKey = `אחר:${click.targetParamValue}`;
        if (!targetMap[otherKey]) {
            targetMap[otherKey] = { name: `אחר (${click.targetParamValue})`, clicks: 0};
        }
        targetMap[otherKey].clicks++;
      } else {
        untargetedClicks++;
      }
    });

    const populatedTargets = Object.values(targetMap).filter(t => t.clicks > 0 || (link.targetValues || []).find(tv => tv.name === t.name));
    if (untargetedClicks > 0) {
      populatedTargets.push({ name: 'ללא יעד / ברירת מחדל', clicks: untargetedClicks });
    }
    
    if (populatedTargets.length === 0 && totalClicks > 0 && (!link.targetValues || link.targetValues.length === 0)) {
        populatedTargets.push({name: 'כל הקליקים (לא הוגדרו יעדים)', clicks: totalClicks});
    }

    if (populatedTargets.length === 0 && totalClicks === 0) return null;
    // If there are clicks but no targets defined, it will show under "כל הקליקים..."
    if (populatedTargets.length === 0 && totalClicks > 0) {
         populatedTargets.push({name: 'קליקים ללא יעד מוגדר', clicks: totalClicks});
    }


    return {
      labels: populatedTargets.map(t => t.name),
      datasets: [
        {
          label: 'קליקים',
          data: populatedTargets.map(t => t.clicks),
          backgroundColor: 'rgba(2, 132, 199, 0.6)', // sky-600 with opacity
          borderColor: 'rgba(2, 132, 199, 1)', // sky-600
          borderWidth: 1,
        },
      ],
    };
  }, [link.clicks, link.targetValues, totalClicks]);

  const clicksByDateData = useMemo((): ChartData | null => {
    const dateMap: { [key: string]: number } = {};
    link.clicks.forEach(click => {
      const date = new Date(click.insertedAt).toLocaleDateString('he-IL', { year: 'numeric', month: 'short', day: 'numeric' });
      dateMap[date] = (dateMap[date] || 0) + 1;
    });
    
    const sortedDates = Object.entries(dateMap)
      .map(([name, clicks]) => ({ name, clicks }))
      .sort((a,b) => new Date(a.name).getTime() - new Date(b.name).getTime()); // Sorting by actual date needed for correct order

    if (sortedDates.length === 0) return null;
    
    return {
      labels: sortedDates.map(d => d.name),
      datasets: [
        {
          label: 'קליקים יומיים',
          data: sortedDates.map(d => d.clicks),
          fill: false,
          borderColor: 'rgb(14, 165, 233)', // sky-500
          tension: 0.1,
        },
      ],
    };
  }, [link.clicks]);


  return (
    <Card title="ניתוח קליקים">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-50 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-slate-700 mb-2">סה"כ קליקים</h3>
            <p className="text-4xl font-bold text-sky-600">{totalClicks}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg shadow">
             <h3 className="text-lg font-semibold text-slate-700 mb-2">כתובות IP ייחודיות (דגימה)</h3>
            <p className="text-4xl font-bold text-sky-600">{new Set(link.clicks.map(c => c.ipAddress)).size}</p>
            <p className="text-xs text-slate-500 mt-1">הערה: מעקב IP הינו להמחשה בלבד.</p>
        </div>
      </div>

      {clicksByTargetData && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-700 mb-4">קליקים לפי מקור יעד (עמודות)</h3>
            {totalClicks > 0 ? (
              <div className="relative h-72 sm:h-80">
                <Bar options={chartOptionsBase} data={clicksByTargetData} />
              </div>
            ) : (
              <p className="text-slate-500">אין עדיין קליקים להצגת פילוח לפי מקור.</p>
            )}
          </div>
           <div>
            <h3 className="text-xl font-semibold text-slate-700 mb-4">קליקים לפי מקור יעד (דונאט)</h3>
            {totalClicks > 0 ? (
              <div className="relative h-72 sm:h-80">
                <Doughnut 
                  data={clicksByTargetData} 
                  options={{
                    ...chartOptionsBase,
                    scales: { // Doughnut charts don't have scales in the same way
                        y: { display: false },
                        x: { display: false }
                    }
                  }} 
                />
              </div>
            ) : (
              <p className="text-slate-500">אין עדיין קליקים להצגת פילוח לפי מקור.</p>
            )}
          </div>
        </div>
      )}
      
      {clicksByDateData && (
         <div className="mt-8">
          <h3 className="text-xl font-semibold text-slate-700 mb-4">קליקים לאורך זמן (יומי)</h3>
           {totalClicks > 0 ? (
            <div className="relative h-72 sm:h-80">
              <Line options={chartOptionsBase} data={clicksByDateData} />
            </div>
           ) : (
             <p className="text-slate-500">אין עדיין קליקים להצגת מגמה לאורך זמן.</p>
           )}
        </div>
      )}

      {link.clicks.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-slate-700 mb-4">קליקים אחרונים (10 אחרונים)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="py-2 px-3 text-start font-semibold text-slate-600">חותמת זמן</th>
                  <th className="py-2 px-3 text-start font-semibold text-slate-600">כתובת IP</th>
                  <th className="py-2 px-3 text-start font-semibold text-slate-600">ערך יעד</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {link.clicks.slice(-10).reverse().map(click => (
                  <tr key={click._id}>
                    <td className="py-2 px-3 text-slate-700">{new Date(click.insertedAt).toLocaleString('he-IL')}</td>
                    <td className="py-2 px-3 text-slate-700">{click.ipAddress}</td>
                    <td className="py-2 px-3 text-slate-700">{click.targetParamValue || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
       {totalClicks === 0 && (!clicksByTargetData || clicksByTargetData.labels.length === 0) && !clicksByDateData && (
         <p className="text-slate-500 mt-8">קישור זה עדיין לא קיבל קליקים.</p>
       )}
    </Card>
  );
};

export default LinkAnalytics;