import React, { useState, useEffect, useCallback, useMemo } from 'react';

const SalesQuestDashboard = () => {
  const [salesData, setSalesData] = useState([]);
  const [uploadMessage, setUploadMessage] = useState('');
  const [selectedView, setSelectedView] = useState('leaderboard');
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // WordPress API configuration
  const WORDPRESS_API_BASE = 'https://pamdash.wpenginepowered.com/wp-json/sales/v1';

  // Sample data with percentage-based metrics - memoized to prevent re-creation
  const sampleData = useMemo(() => [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "SJ",
      photoUrl: "", // Empty to force fallback to initials
      callsPercent: 89,
      pemPercent: 120,
      oppsActualPercent: 100,
      oppsPassedPercent: 116,
      closedWonPercent: 128,
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
      photoUrl: "", // Empty to force fallback to initials
      callsPercent: 95,
      pemPercent: 127,
      oppsActualPercent: 100,
      oppsPassedPercent: 113,
      closedWonPercent: 93,
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
      photoUrl: "", // Empty to force fallback to initials
      callsPercent: 124,
      pemPercent: 83,
      oppsActualPercent: 57,
      oppsPassedPercent: 78,
      closedWonPercent: 127,
      totalQuestScore: 0,
      completedQuests: [],
      level: "Quest Explorer",
      streak: 15,
      team: "Sales Team"
    }
  ], []);

  const calculateQuestMetrics = useCallback((person) => {
    const quests = [
      {
        name: "Closed Won",
        icon: "💰",
        completionRate: person.closedWonPercent || 0,
        type: "closed_won", 
        weight: 60, // 60% of total score
        maxPoints: 600
      },
      {
        name: "Pipeline Passed", 
        icon: "📈",
        completionRate: person.oppsPassedPercent || 0,
        type: "opps_passed",
        weight: 15, // 15% of total score
        maxPoints: 150
      },
      {
        name: "Calls",
        icon: "📞",
        completionRate: person.callsPercent || 0,
        type: "calls",
        weight: 5, // 5% of total score
        maxPoints: 50
      },
      {
        name: "PEM",
        icon: "👤",
        completionRate: person.pemPercent || 0,
        type: "pem",
        weight: 5, // 5% of total score
        maxPoints: 50
      },
      {
        name: "Opportunities Created",
        icon: "🎯",
        completionRate: person.oppsActualPercent || 0,
        type: "opportunities",
        weight: 15, // 15% of total score
        maxPoints: 150
      }
    ];

    const completedQuests = [];
    let totalQuestScore = 0;
    let totalPossibleScore = 1000; // Total possible points

    quests.forEach(quest => {
      const completionRate = Math.min(quest.completionRate, 150); // Cap at 150%
      const questScore = Math.round((completionRate / 100) * quest.maxPoints);
      
      totalQuestScore += questScore;

      if (quest.completionRate >= 100) {
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
  }, []);

  const loadDataFromWordPress = useCallback(async () => {
    // First, check for locally stored data
    const localData = localStorage.getItem('salesDashboardData');
    if (localData) {
      try {
        const parsedLocalData = JSON.parse(localData);
        // Check if the data has the new percentage format
        if (parsedLocalData.length > 0 && parsedLocalData[0].closedWonPercent !== undefined) {
          setSalesData(parsedLocalData);
          return; // Use local data and exit early
        } else {
          // Clear old format data
          localStorage.removeItem('salesDashboardData');
        }
      } catch (error) {
        console.error('Error parsing local data:', error);
        localStorage.removeItem('salesDashboardData'); // Clear corrupted data
      }
    }

    // If no local data, try WordPress
    try {
      const response = await fetch(`${WORDPRESS_API_BASE}/data`);
      const result = await response.json();
      if (result.success && result.data.length > 0) {
        // Use WordPress data if available
        const processedData = result.data.map(person => ({
          ...person,
          ...calculateQuestMetrics(person)
        }));
        setSalesData(processedData);
      } else {
        // Use sample data if no WordPress data exists
        const processedData = sampleData.map(person => ({
          ...person,
          ...calculateQuestMetrics(person)
        }));
        setSalesData(processedData);
      }
    } catch (error) {
      console.error('Error loading data from WordPress:', error);
      // Fallback to sample data
      const processedData = sampleData.map(person => ({
        ...person,
        ...calculateQuestMetrics(person)
      }));
      setSalesData(processedData);
    }
  }, [WORDPRESS_API_BASE, sampleData, calculateQuestMetrics]);

  useEffect(() => {
    // Load data from WordPress on component mount
    loadDataFromWordPress();
  }, [loadDataFromWordPress]);

  // Save data to localStorage whenever salesData changes
  useEffect(() => {
    if (salesData.length > 0) {
      localStorage.setItem('salesDashboardData', JSON.stringify(salesData));
    }
  }, [salesData]);

  const saveToWordPress = async (salesData) => {
    try {
      const response = await fetch(`${WORDPRESS_API_BASE}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          salesData: salesData,
          title: `Sales Data - ${new Date().toLocaleDateString()}`
        })
      });
      const result = await response.json();
      if (result.success) {
        setUploadMessage(`✅ Successfully saved ${result.count} sales warriors to WordPress!`);
        // Don't reload from WordPress - keep the current data visible
      } else {
        setUploadMessage('❌ Error saving to WordPress: ' + result.message + ' (Data still visible locally)');
      }
    } catch (error) {
      setUploadMessage('❌ Error connecting to WordPress: ' + error.message + ' (Data still visible locally)');
      console.error('WordPress save error:', error);
    }
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
            
            // Map to our expected field names (percentage-based)
            entry.name = dataMap['PAM'] || '';
            entry.team = 'Sales Team'; // Default team
            entry.photoUrl = dataMap['Photo URL'] || '';
            entry.callsPercent = parseFloat(dataMap['Calls %']) || 0;
            entry.pemPercent = parseFloat(dataMap['PEM %']) || 0;
            entry.oppsActualPercent = parseFloat(dataMap['Opps Actual %']) || 0;
            entry.oppsPassedPercent = parseFloat(dataMap['Opps Passed %']) || 0;
            entry.closedWonPercent = parseFloat(dataMap['Closed Won %']) || 0;
            
            entry.avatar = entry.name ? entry.name.split(' ').map(n => n[0]).join('') : 'XX';
            return { ...entry, ...calculateQuestMetrics(entry) };
          });
          
          setSalesData(parsedData);
          
          // Save to WordPress
          saveToWordPress(parsedData);
          
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
    const csvContent = `PAM,Photo URL,Calls %,PEM %,Opps Actual %,Opps Passed %,Closed Won %
Sarah Johnson,https://example.com/photos/sarah.jpg,89,120,100,116,128
Mike Chen,https://example.com/photos/mike.jpg,95,127,100,113,93
Emma Williams,https://example.com/photos/emma.jpg,124,83,57,78,127
David Rodriguez,https://example.com/photos/david.jpg,96,88,60,80,122
Lisa Thompson,https://example.com/photos/lisa.jpg,108,114,78,113,117
Alex Kim,https://example.com/photos/alex.jpg,95,133,125,127,127`;
    
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
    if (status === 'completed') return 'bg-green-500';
    if (status === 'almost') return 'bg-yellow-500';
    if (completionRate >= 50) return 'bg-blue-500';
    return 'bg-gray-400';
  };

  const getQuestStatusIcon = (status) => {
    if (status === 'completed') return <span className="text-green-500">✅</span>;
    if (status === 'almost') return <span className="text-yellow-500">⚠️</span>;
    return <span className="text-blue-500">🎯</span>;
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'Quest Legendary': return <span className="text-yellow-500">🏆</span>;
      case 'Quest Master': return <span className="text-teal-500">🏆</span>;
      case 'Quest Warrior': return <span className="text-blue-500">🥇</span>;
      case 'Quest Explorer': return <span className="text-blue-600">⭐</span>;
      default: return <span className="text-gray-500">🥇</span>;
    }
  };

  // Avatar component to handle image loading with fallback
  const Avatar = ({ person, size = "w-14 h-14", textSize = "text-xl" }) => {
    const [imageError, setImageError] = useState(false);
    const hasPartyHat = person.closedWonPercent >= 100;
    
    // Generate avatar initials from name if avatar field is missing
    const getInitials = (name) => {
      if (!name) return 'XX';
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };
    
    const initials = person.avatar || getInitials(person.name);
    
    // Generate consistent colors based on name
    const getAvatarColor = (name) => {
      if (!name) return 'from-blue-600 to-blue-800';
      const colors = [
        'from-blue-600 to-blue-800',
        'from-green-600 to-green-800',
        'from-purple-600 to-purple-800',
        'from-red-600 to-red-800',
        'from-yellow-600 to-yellow-800',
        'from-indigo-600 to-indigo-800',
        'from-pink-600 to-pink-800',
        'from-teal-600 to-teal-800'
      ];
      const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      return colors[hash % colors.length];
    };
    
    const avatarColor = getAvatarColor(person.name);
    
    const avatarContent = person.photoUrl && person.photoUrl.trim() && !imageError ? (
      <img
        src={person.photoUrl}
        alt={person.name}
        className={`${size} rounded-full object-cover border-2 border-white shadow-lg`}
        onError={() => setImageError(true)}
      />
    ) : (
      <div className={`${size} bg-gradient-to-r ${avatarColor} rounded-full flex items-center justify-center text-white font-bold ${textSize} font-inter shadow-lg border-2 border-white`}>
        {initials}
      </div>
    );

    if (hasPartyHat) {
      return (
        <div className="relative">
          {avatarContent}
          {/* Party Hat */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
            <div className="relative">
              {/* Hat cone */}
              <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent border-b-purple-500"></div>
              {/* Hat stripes */}
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[2px] border-l-transparent border-r-transparent border-b-yellow-400"></div>
              <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-b-[2px] border-l-transparent border-r-transparent border-b-pink-400"></div>
              {/* Hat pom-pom */}
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-orange-400 rounded-full"></div>
            </div>
          </div>
        </div>
      );
    }

    return avatarContent;
  };

  const sortedData = [...salesData].sort((a, b) => b.totalQuestScore - a.totalQuestScore);
  const summitSortedData = [...salesData].sort((a, b) => b.closedWonPercent - a.closedWonPercent);

  // Function to calculate mountain position based on closed won percentage
  const getMountainPosition = (closedWonPercent) => {
    const percentage = Math.min(closedWonPercent, 150); // Cap at 150%
    
    if (percentage >= 100) return { bottom: '75%', left: '50%', level: 'summit' };
    if (percentage >= 75) return { bottom: '60%', left: '45%', level: 'high' };
    if (percentage >= 50) return { bottom: '45%', left: '40%', level: 'mid' };
    if (percentage >= 25) return { bottom: '30%', left: '35%', level: 'low' };
    return { bottom: '15%', left: '30%', level: 'base' };
  };

  const renderSummitChallenge = () => (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
      <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
        <span className="text-lg sm:text-2xl">🏔️</span>
        <span className="leading-tight">Summit Challenge - Closed Won Performance</span>
      </h2>
      
      {/* Mountain Container */}
      <div className="relative w-full h-64 sm:h-80 lg:h-96 bg-gradient-to-b from-blue-400 via-blue-300 to-blue-200 rounded-lg overflow-hidden">
        {/* Clouds */}
        <div className="absolute top-4 left-8 w-16 h-8 bg-white rounded-full opacity-80"></div>
        <div className="absolute top-6 left-12 w-12 h-6 bg-white rounded-full opacity-60"></div>
        <div className="absolute top-8 right-16 w-20 h-10 bg-white rounded-full opacity-70"></div>
        <div className="absolute top-12 right-20 w-14 h-7 bg-white rounded-full opacity-50"></div>
        <div className="absolute top-16 left-1/4 w-18 h-9 bg-white rounded-full opacity-60"></div>
        
        {/* Mountain */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
          {/* Mountain Base */}
          <div className="relative">
            <div className="w-0 h-0 border-l-[200px] border-r-[200px] border-b-[300px] border-l-transparent border-r-transparent border-b-gray-600"></div>
            {/* Mountain Snow Cap */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[80px] border-r-[80px] border-b-[120px] border-l-transparent border-r-transparent border-b-white"></div>
            
            {/* Party Parrot at Summit */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
              <img 
                src="https://media.tenor.com/8AqUPOC5GMgAAAAm/parrot-party.webp" 
                alt="Party Parrot at Summit" 
                className="w-12 h-12"
              />
            </div>
          </div>
        </div>
        
        {/* Sales Reps positioned on mountain */}
        {summitSortedData.map((person, index) => {
          const position = getMountainPosition(person.closedWonPercent);
          const horizontalOffset = index * 35; // Increased spacing between people
          const verticalJitter = (index % 3) * 8; // Add slight vertical variation to avoid perfect alignment
          
          return (
            <div
              key={person.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-in-out group cursor-pointer"
              style={{
                bottom: `calc(${position.bottom} + ${verticalJitter}px)`,
                left: `calc(${position.left} + ${horizontalOffset - 60}px)`,
              }}
            >
              {/* Climber Avatar */}
              <div className="relative">
                <Avatar person={person} size="w-10 h-10" textSize="text-sm" />
                
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                    <div className="font-semibold">{person.name}</div>
                    <div>Closed Won: {Math.round(person.closedWonPercent)}%</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      
      {/* Performance Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {summitSortedData.slice(0, 3).map((person, index) => (
          <div key={person.id} className={`p-4 rounded-lg border-2 ${
            index === 0 ? 'border-yellow-400 bg-yellow-50' :
            index === 1 ? 'border-gray-400 bg-gray-50' :
            'border-orange-400 bg-orange-50'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                index === 0 ? 'bg-yellow-500' :
                index === 1 ? 'bg-gray-500' :
                'bg-orange-500'
              }`}>
                {index + 1}
              </div>
              <Avatar person={person} size="w-8 h-8" textSize="text-sm" />
              <div>
                <div className="font-semibold text-gray-800">{person.name}</div>
                <div className="text-sm text-gray-600">{Math.round(person.closedWonPercent)}% Closed Won</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderQuestCard = (person) => (
    <div key={person.id} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2 border-gray-200 hover:border-teal-500 transition-all duration-300 font-inter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Avatar person={person} size="w-12 h-12 sm:w-14 sm:h-14" textSize="text-lg sm:text-xl" />
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 font-lora">{person.name}</h3>
            <div className="flex items-center gap-2">
              {getLevelIcon(person.level)}
              <span className="text-xs sm:text-sm font-medium text-gray-600 font-inter">{person.level}</span>
            </div>
            <div className="text-xs sm:text-sm text-gray-500 font-inter">{person.team || 'Sales Team'}</div>
          </div>
        </div>
        <div className="text-center sm:text-right">
          <div className="text-2xl sm:text-3xl font-bold text-teal-600 font-lora">{person.totalQuestScore}</div>
          <div className="text-xs sm:text-sm text-gray-600 font-inter">Quest Points</div>
          <div className="text-xs sm:text-sm text-teal-600 font-medium font-inter">
            {person.completedQuestCount}/5 Quests Complete
          </div>
        </div>
      </div>

      {/* Quest Progress */}
      <div className="space-y-4">
        {person.quests?.map((quest, index) => {
          return (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {quest.type === 'closed_won' && quest.completionRate >= 100 ? (
                    <img 
                      src="https://media.tenor.com/8AqUPOC5GMgAAAAm/parrot-party.webp" 
                      alt="Party Parrot" 
                      className="w-6 h-6"
                    />
                  ) : (
                    <span className="text-lg">{quest.icon}</span>
                  )}
                  <span className="font-medium text-gray-800">{quest.name}</span>
                  {getQuestStatusIcon(quest.status)}
                </div>
                <div className="text-sm font-medium text-gray-600">
                  {quest.questScore || 0}/{quest.maxPoints || 0} pts (Weight: {quest.weight || 0}%)
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">
                  Performance Achievement
                </span>
                <span className={`font-medium ${
                  quest.completionRate >= 100 ? 'text-green-600' :
                  quest.completionRate >= 80 ? 'text-yellow-600' : 'text-teal-600'
                }`}>
                  {Math.round(quest.completionRate || 0)}%
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
                  <span className="text-sm">⭐</span>
                  <span className="text-xs font-medium">BONUS! +{Math.round((quest.completionRate || 0) - 100)}%</span>
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
            {Math.round(person.overallCompletion || 0)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="h-4 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all duration-500"
            style={{ width: `${Math.min(person.overallCompletion || 0, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );

  const renderLeaderboard = () => (
    <div className="space-y-3 sm:space-y-4">
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
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-white text-base sm:text-lg ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                  index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                  index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                  'bg-gradient-to-r from-blue-400 to-blue-600'
                }`}>
                  {index + 1}
                </div>
                
                <Avatar person={person} size="w-10 h-10 sm:w-12 sm:h-12" textSize="text-base sm:text-lg" />
                
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-gray-900">{person.name}</h3>
                  <div className="flex items-center gap-2">
                    {getLevelIcon(person.level)}
                    <span className="text-xs sm:text-sm font-medium text-gray-600">{person.level}</span>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">{person.team}</div>
                </div>
              </div>
              
              <div className="text-center sm:text-right">
                <div className="text-2xl sm:text-3xl font-bold text-teal-600">{person.totalQuestScore || 0}</div>
                <div className="text-xs sm:text-sm text-gray-600">Quest Points</div>
                <div className="text-xs sm:text-sm font-medium text-green-600">
                  {person.completedQuestCount || 0}/5 Complete
                </div>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-5 gap-1 sm:gap-2">
              {person.quests?.map((quest, questIndex) => {
                const questTitles = ['Closed Won', 'Pipeline Passed', 'Calls', 'PEM', 'Opportunities'];
                const shortTitles = ['Won', 'Pipeline', 'Calls', 'PEM', 'Opps'];
                return (
                  <div key={questIndex} className="text-center">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto rounded-full flex items-center justify-center text-white ${
                      quest.status === 'completed' ? 'bg-green-500' :
                      quest.status === 'almost' ? 'bg-yellow-500' : 'bg-gray-300'
                    }`}>
                      {quest.type === 'closed_won' && quest.completionRate >= 100 ? (
                        <img 
                          src="https://media.tenor.com/8AqUPOC5GMgAAAAm/parrot-party.webp" 
                          alt="Party Parrot" 
                          className="w-4 h-4 sm:w-6 sm:h-6 rounded-full"
                        />
                      ) : (
                        <span className="text-xs sm:text-sm">{quest.icon}</span>
                      )}
                    </div>
                    <div className="text-xs mt-1 text-gray-800 font-medium hidden sm:block">{questTitles[questIndex]}</div>
                    <div className="text-xs mt-1 text-gray-800 font-medium sm:hidden">{shortTitles[questIndex]}</div>
                    <div className="text-xs text-gray-600">{Math.round(quest.completionRate || 0)}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 p-3 sm:p-6 font-inter">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-4">
                <img 
                  src="https://wpmktgatlas.wpengine.com/wp-content/uploads/2025/06/WP-Engine-15-year-anniversary.svg"
                  alt="WP Engine"
                  className="h-8 sm:h-12 w-auto"
                  onError={(e) => {e.target.style.display = 'none'}}
                />
                <div className="hidden sm:block h-8 w-px bg-gray-300"></div>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3 font-lora">
                <span className="text-lg sm:text-2xl lg:text-3xl">🏆</span>
                <span className="leading-tight">Sales Performance Dashboard</span>
              </h1>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium font-inter text-sm sm:text-base w-full sm:w-auto"
            >
              <span>📤</span>
              <span className="hidden xs:inline">Upload Data</span>
              <span className="xs:hidden">Upload</span>
            </button>
          </div>
          <p className="text-sm sm:text-base text-gray-700 font-inter">Track your sales performance and achieve excellence with WP Engine</p>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
            <button
              onClick={() => setSelectedView('leaderboard')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors font-inter text-sm sm:text-base ${
                selectedView === 'leaderboard' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              🏆 Leaderboard
            </button>
            <button
              onClick={() => setSelectedView('overview')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors font-inter text-sm sm:text-base ${
                selectedView === 'overview' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              📊 Performance Overview
            </button>
            <button
              onClick={() => setSelectedView('summit')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors font-inter text-sm sm:text-base ${
                selectedView === 'summit' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              <img 
                src="https://media.tenor.com/8AqUPOC5GMgAAAAm/parrot-party.webp" 
                alt="Party Parrot" 
                className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2"
              />
              Challenge
            </button>
          </div>
        </div>

        {/* Content */}
        {selectedView === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedData.map(renderQuestCard)}
          </div>
        )}

        {selectedView === 'leaderboard' && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              Quest Leaderboard
            </h2>
            {renderLeaderboard()}
          </div>
        )}

        {selectedView === 'summit' && renderSummitChallenge()}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <span>📤</span>
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
                  <span className="text-4xl block mb-3">📤</span>
                  <p className="text-lg text-gray-600 mb-2">Upload CSV File</p>
                  <p className="text-sm text-gray-500">
                    Headers: PAM, Photo URL, Calls %, PEM %, Opps Actual %, Opps Passed %, Closed Won %
                  </p>
                </label>
              </div>
              
              <div className="flex justify-between items-center">
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-colors text-sm font-medium"
                >
                  <span>📥</span>
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
