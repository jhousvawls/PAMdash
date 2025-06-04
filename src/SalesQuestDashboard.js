import React, { useState, useEffect } from 'react';
import { Upload, Trophy, Target, TrendingUp, Users, Award, Calendar, Download, Filter, Star, Zap, Crown, Medal, Phone, UserCheck, DollarSign, CheckCircle, AlertCircle, Flame } from 'lucide-react';

const SalesQuestDashboard = () => {
  const [salesData, setSalesData] = useState([]);
  const [uploadMessage, setUploadMessage] = useState('');
  const [selectedView, setSelectedView] = useState('leaderboard');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Sample data with your 5 metrics
  const sampleData = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "SJ",
      // Goals
      callsGoal: 100,
      pemGoal: 20,
      oppsGoal: 8,
      oppsPassedMrrGoal: 50000,
      closedWonMrrGoal: 25000,
      // Actuals
      callsActual: 89,
      pemActual: 24,
      oppsActual: 8,
      oppsPassedMrrActual: 58000,
      closedWonMrrActual: 32000,
      // Calculated fields
      totalQuestScore: 0,
      completedQuests: [],
      level: "Quest Master",
      streak: 12,
      team: "Sales Team"
    },
    {
      id: 2,
      name: "Mike Chen",
      avatar: "MC",
      callsGoal: 80,
      pemGoal: 15,
      oppsGoal: 6,
      oppsPassedMrrGoal: 40000,
      closedWonMrrGoal: 20000,
      callsActual: 76,
      pemActual: 19,
      oppsActual: 6,
      oppsPassedMrrActual: 45000,
      closedWonMrrActual: 18500,
      totalQuestScore: 0,
      completedQuests: [],
      level: "Quest Warrior",
      streak: 8,
      team: "Sales Team"
    },
    {
      id: 3,
      name: "Emma Williams",
      avatar: "EW",
      callsGoal: 90,
      pemGoal: 18,
      oppsGoal: 7,
      oppsPassedMrrGoal: 45000,
      closedWonMrrGoal: 22000,
      callsActual: 112,
      pemActual: 15,
      oppsActual: 4,
      oppsPassedMrrActual: 35000,
      closedWonMrrActual: 28000,
      totalQuestScore: 0,
      completedQuests: [],
      level: "Quest Explorer",
      streak: 15,
      team: "Sales Team"
    }
  ];

  useEffect(() => {
    const processedData = sampleData.map(person => ({
      ...person,
      ...calculateQuestMetrics(person)
    }));
    setSalesData(processedData);
  }, []);

  const calculateQuestMetrics = (person) => {
    const quests = [
      {
        name: "Revenue Royalty",
        icon: Crown,
        goal: person.closedWonMrrGoal,
        actual: person.closedWonMrrActual,
        type: "closed_mrr", 
        weight: 60, // 60% of total score
        maxPoints: 600
      },
      {
        name: "Pipeline Paladin", 
        icon: TrendingUp,
        goal: person.oppsPassedMrrGoal,
        actual: person.oppsPassedMrrActual,
        type: "pipeline_mrr",
        weight: 15, // 15% of total score
        maxPoints: 150
      },
      {
        name: "Call Crusader",
        icon: Phone,
        goal: person.callsGoal,
        actual: person.callsActual,
        type: "calls",
        weight: 8, // 8% of total score
        maxPoints: 80
      },
      {
        name: "PEM Pioneer",
        icon: UserCheck,
        goal: person.pemGoal,
        actual: person.pemActual,
        type: "pem",
        weight: 10, // 10% of total score
        maxPoints: 100
      },
      {
        name: "Opportunity Oracle",
        icon: Target,
        goal: person.oppsGoal,
        actual: person.oppsActual,
        type: "opportunities",
        weight: 7, // 7% of total score
        maxPoints: 70
      }
    ];

    const completedQuests = [];
    let totalQuestScore = 0;
    let totalPossibleScore = 1000; // Total possible points

    quests.forEach(quest => {
      const completionRate = Math.min((quest.actual / quest.goal) * 100, 150); // Cap at 150%
      const questScore = Math.round((completionRate / 100) * quest.maxPoints);
      
      totalQuestScore += questScore;

      if (quest.actual >= quest.goal) {
        completedQuests.push({
          ...quest,
          completionRate,
          questScore,
          status: 'completed'
        });
      } else {
        completedQuests.push({
          ...quest,
          completionRate,
          questScore,
          status: completionRate >= 80 ? 'almost' : 'in_progress'
        });
      }
    });

    const overallCompletion = (totalQuestScore / totalPossibleScore) * 100;
    let level = "Quest Novice";
    if (overallCompletion >= 90) level = "Quest Legendary";
    else if (overallCompletion >= 80) level = "Quest Master";
    else if (overallCompletion >= 70) level = "Quest Warrior";
    else if (overallCompletion >= 60) level = "Quest Explorer";

    return {
      quests: completedQuests,
      totalQuestScore,
      totalPossibleScore,
      overallCompletion,
      level,
      completedQuestCount: completedQuests.filter(q => q.status === 'completed').length
    };
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csvData = e.target.result;
          const lines = csvData.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          
          const parsedData = lines.slice(1).filter(line => line.trim()).map((line, index) => {
            const values = line.split(',').map(v => v.trim());
            const entry = { id: index + 1 };
            
            // Create a mapping object for easier access
            const dataMap = {};
            headers.forEach((header, i) => {
              if (values[i]) {
                dataMap[header] = values[i];
              }
            });
            
            // Map to our expected field names
            entry.name = dataMap['PAM'] || '';
            entry.team = 'Sales Team'; // Default team since no team column
            entry.callsGoal = parseFloat(dataMap['Calls Goal']) || 0;
            entry.callsActual = parseFloat(dataMap['Calls Actual']) || 0;
            entry.pemGoal = parseFloat(dataMap['PEM Goal']) || 0;
            entry.pemActual = parseFloat(dataMap['PEM Actual']) || 0;
            entry.oppsGoal = parseFloat(dataMap['Opps Goal']) || 0;
            entry.oppsActual = parseFloat(dataMap['Opps Actual']) || 0;
            entry.oppsPassedMrrGoal = parseFloat(dataMap['Opps Passed Goal']) || 0;
            entry.oppsPassedMrrActual = parseFloat(dataMap['Opps Passed Actual']) || 0;
            entry.closedWonMrrGoal = parseFloat(dataMap['Closed Won Goal']) || 0;
            entry.closedWonMrrActual = parseFloat(dataMap['Closed Won Actual']) || 0;
            
            entry.avatar = entry.name ? entry.name.split(' ').map(n => n[0]).join('') : 'XX';
            return { ...entry, ...calculateQuestMetrics(entry) };
          });
          
          setSalesData(parsedData);
          setUploadMessage(`✅ Successfully uploaded ${parsedData.length} sales warriors!`);
          setTimeout(() => setUploadMessage(''), 3000);
        } catch (error) {
          setUploadMessage('❌ Error parsing CSV file. Please check format.');
          setTimeout(() => setUploadMessage(''), 3000);
        }
      };
      reader.readAsText(file);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `PAM,Calls Goal,Calls Actual,Calls %,PEM Goal,PEM Actual,PEM %,Opps Goal,Opps Actual,Opps Actual %,Opps Passed Goal,Opps Passed Actual,Opps Passed %,Closed Won Goal,Closed Won Actual,Closed Won %
Sarah Johnson,100,89,89,20,24,120,8,8,100,50000,58000,116,25000,32000,128
Mike Chen,80,76,95,15,19,127,6,6,100,40000,45000,113,20000,18500,93
Emma Williams,90,112,124,18,15,83,7,4,57,45000,35000,78,22000,28000,127
David Rodriguez,85,82,96,16,14,88,5,3,60,35000,28000,80,18000,22000,122
Lisa Thompson,95,103,108,22,25,114,9,7,78,55000,62000,113,30000,35000,117
Alex Kim,75,71,95,12,16,133,4,5,125,30000,38000,127,15000,19000,127`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'sales_quest_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getQuestStatusColor = (status, completionRate) => {
    if (status === 'completed') return 'bg-wp-teal';
    if (status === 'almost') return 'bg-wp-blue';
    if (completionRate >= 50) return 'bg-wp-blue';
    return 'bg-gray-400';
  };

  const getQuestStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle className="w-5 h-5 text-wp-teal" />;
    if (status === 'almost') return <AlertCircle className="w-5 h-5 text-wp-blue" />;
    return <Target className="w-5 h-5 text-wp-navy" />;
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'Quest Legendary': return <Crown className="w-6 h-6 text-yellow-500" />;
      case 'Quest Master': return <Trophy className="w-6 h-6 text-wp-teal" />;
      case 'Quest Warrior': return <Medal className="w-6 h-6 text-wp-blue" />;
      case 'Quest Explorer': return <Star className="w-6 h-6 text-wp-navy" />;
      default: return <Award className="w-6 h-6 text-gray-500" />;
    }
  };

  const sortedData = [...salesData].sort((a, b) => b.totalQuestScore - a.totalQuestScore);

  const renderQuestCard = (person) => (
    <div key={person.id} className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 hover:border-wp-teal transition-all duration-300 font-inter">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-gradient-to-r from-wp-navy to-wp-blue rounded-full flex items-center justify-center text-white font-bold text-xl font-inter">
            {person.avatar}
          </div>
          <div>
            <h3 className="text-xl font-bold text-wp-navy font-lora">{person.name}</h3>
            <div className="flex items-center gap-2">
              {getLevelIcon(person.level)}
              <span className="text-sm font-medium text-wp-navy font-inter">{person.level}</span>
            </div>
            <div className="text-sm text-gray-500 font-inter">{person.team}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-wp-teal font-lora">{person.totalQuestScore}</div>
          <div className="text-sm text-wp-navy font-inter">Quest Points</div>
          <div className="text-sm text-wp-teal font-medium font-inter">
            {person.completedQuestCount}/5 Quests Complete
          </div>
        </div>
      </div>

      {/* Quest Progress */}
      <div className="space-y-4">
        {person.quests?.map((quest, index) => {
          const IconComponent = quest.icon;
          return (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <IconComponent className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-800">{quest.name}</span>
                  {getQuestStatusIcon(quest.status)}
                </div>
                <div className="text-sm font-medium text-gray-600">
                  {quest.questScore}/{quest.maxPoints} pts (Weight: {quest.weight}%)
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">
                  {quest.type.includes('mrr') ? `$${quest.actual.toLocaleString()}` : quest.actual} / {quest.type.includes('mrr') ? `$${quest.goal.toLocaleString()}` : quest.goal}
                </span>
                <span className={`font-medium ${
                  quest.completionRate >= 100 ? 'text-green-600' :
                  quest.completionRate >= 80 ? 'text-yellow-600' : 'text-teal-600'
                }`}>
                  {Math.round(quest.completionRate)}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${getQuestStatusColor(quest.status, quest.completionRate)}`}
                  style={{ width: `${Math.min(quest.completionRate, 100)}%` }}
                ></div>
              </div>
              
              {quest.completionRate > 100 && (
                <div className="flex items-center gap-1 mt-1 text-green-600">
                  <Flame className="w-4 h-4" />
                  <span className="text-xs font-medium">BONUS! +{Math.round(quest.completionRate - 100)}%</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall Progress */}
      <div className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg border">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-800">Overall Quest Progress</span>
          <span className="text-sm font-bold text-teal-600">
            {Math.round(person.overallCompletion)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="h-4 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all duration-500"
            style={{ width: `${Math.min(person.overallCompletion, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );

  const renderLeaderboard = () => (
    <div className="space-y-4">
      {sortedData.map((person, index) => (
        <div
          key={person.id}
          className={`relative overflow-hidden rounded-lg border-2 transition-all duration-300 hover:shadow-lg ${
            index === 0 ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50' :
            index === 1 ? 'border-gray-400 bg-gradient-to-r from-gray-50 to-blue-50' :
            index === 2 ? 'border-orange-400 bg-gradient-to-r from-orange-50 to-red-50' :
            'border-gray-200 bg-white'
          }`}
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                  index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                  index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                  'bg-gradient-to-r from-blue-400 to-blue-600'
                }`}>
                  {index + 1}
                </div>
                
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {person.avatar}
                </div>
                
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{person.name}</h3>
                  <div className="flex items-center gap-2">
                    {getLevelIcon(person.level)}
                    <span className="text-sm font-medium text-gray-600">{person.level}</span>
                  </div>
                  <div className="text-sm text-gray-500">{person.team}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-teal-600">{person.totalQuestScore}</div>
                <div className="text-sm text-gray-600">Quest Points</div>
                <div className="text-sm font-medium text-green-600">
                  {person.completedQuestCount}/5 Complete
                </div>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-5 gap-2">
              {person.quests?.map((quest, questIndex) => (
                <div key={questIndex} className="text-center">
                  <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                    quest.status === 'completed' ? 'bg-green-500' :
                    quest.status === 'almost' ? 'bg-yellow-500' : 'bg-gray-300'
                  }`}>
                    <quest.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-xs mt-1 text-gray-600">{Math.round(quest.completionRate)}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTeamOverview = () => {
    const teamStats = salesData.reduce((acc, person) => {
      const team = person.team || 'Unknown';
      if (!acc[team]) {
        acc[team] = {
          members: [],
          totalQuestScore: 0,
          completedQuests: 0,
          totalPossibleQuests: 0
        };
      }
      acc[team].members.push(person);
      acc[team].totalQuestScore += person.totalQuestScore || 0;
      acc[team].completedQuests += person.completedQuestCount || 0;
      acc[team].totalPossibleQuests += 5;
      return acc;
    }, {});

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(teamStats).map(([teamName, stats]) => (
          <div key={teamName} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-teal-500" />
              {teamName}
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Team Members:</span>
                <span className="font-medium">{stats.members.length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-teal-600">Total Quest Points:</span>
                <span className="font-bold text-teal-600">{stats.totalQuestScore}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Completed Quests:</span>
                <span className="font-medium text-green-600">
                  {stats.completedQuests}/{stats.totalPossibleQuests}
                </span>
              </div>
              
              <div className="space-y-2">
                {stats.members.map(member => (
                  <div key={member.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {member.avatar}
                      </div>
                      <span>{member.name}</span>
                    </div>
                    <span className="font-medium text-teal-600">{member.totalQuestScore}pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 p-6 font-inter">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-wp-navy text-white px-4 py-2 rounded-lg font-bold text-xl font-inter">
                WP ENGINE
              </div>
              <div className="h-8 w-px bg-gray-300"></div>
              <h1 className="text-4xl font-bold text-wp-navy flex items-center gap-3 font-lora">
                <Trophy className="w-10 h-10 text-wp-teal" />
                Sales Performance Dashboard
              </h1>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-wp-blue hover:bg-blue-700 text-white rounded-lg transition-colors font-medium font-inter"
            >
              <Upload className="w-4 h-4" />
              Upload Data
            </button>
          </div>
          <p className="text-wp-navy font-inter">Track your sales performance and achieve excellence with WP Engine</p>
        </div>


        {/* Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => setSelectedView('leaderboard')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors font-inter ${
                selectedView === 'leaderboard' 
                  ? 'bg-wp-navy text-white' 
                  : 'bg-gray-100 text-wp-navy hover:bg-blue-50'
              }`}
            >
              Leaderboard
            </button>
            <button
              onClick={() => setSelectedView('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors font-inter ${
                selectedView === 'overview' 
                  ? 'bg-wp-navy text-white' 
                  : 'bg-gray-100 text-wp-navy hover:bg-blue-50'
              }`}
            >
              Performance Overview
            </button>
          </div>
        </div>

        {/* Content */}
        {selectedView === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {salesData.map(renderQuestCard)}
          </div>
        )}

        {selectedView === 'leaderboard' && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Quest Leaderboard
            </h2>
            {renderLeaderboard()}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Sales Data
                </h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors mb-4">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    handleFileUpload(e);
                    setShowUploadModal(false);
                  }}
                  className="hidden"
                  id="modal-csv-upload"
                />
                <label htmlFor="modal-csv-upload" className="cursor-pointer">
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-lg text-gray-600 mb-2">Upload CSV File</p>
                  <p className="text-sm text-gray-500">
                    Headers: PAM, Calls Goal/Actual/%, PEM Goal/Actual/%, Opps Goal/Actual/%, Opps Passed Goal/Actual/%, Closed Won Goal/Actual/%
                  </p>
                </label>
              </div>
              
              <div className="flex justify-between items-center">
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-colors text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
              
              {uploadMessage && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-orange-800">{uploadMessage}</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SalesQuestDashboard;
