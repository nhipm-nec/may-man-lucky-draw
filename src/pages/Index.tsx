import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Gift, Users, Download, Upload, Play, Sparkles, FileText, Settings, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import ConfettiEffect from '@/components/ConfettiEffect';
import WinnersList from '@/components/WinnersList';

interface Prize {
  id: string;
  name: string;
  quantity: number;
  winners: string[];
}

interface User {
  id: string;
  name: string;
  phone?: string;
}

const Index = () => {
  const [currentPrize, setCurrentPrize] = useState<Prize>({
    id: '1',
    name: 'Giải Nhì (2)',
    quantity: 2,
    winners: []
  });
  
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Nguyễn Văn A', phone: '0123456789' },
    { id: '2', name: 'Trần Thị B', phone: '0987654321' },
    { id: '3', name: 'Lê Văn C', phone: '0345678901' },
    { id: '4', name: 'Phạm Thị D', phone: '0567890123' },
    { id: '5', name: 'Hoàng Văn E', phone: '0789012345' }
  ]);
  
  const [prizes, setPrizes] = useState<Prize[]>([
    { id: '1', name: 'Giải Nhất (1)', quantity: 1, winners: [] },
    { id: '2', name: 'Giải Nhì (2)', quantity: 2, winners: [] },
    { id: '3', name: 'Giải Ba (3)', quantity: 3, winners: [] },
    { id: '4', name: 'Giải Khuyến Khích (5)', quantity: 5, winners: [] }
  ]);
  
  const [luckyNumber, setLuckyNumber] = useState<string>('000');
  const [winnerName, setWinnerName] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Customization states
  const [backgroundColor, setBackgroundColor] = useState('#fef7ff'); // light purple
  const [fontFamily, setFontFamily] = useState('Inter');
  const [prizeColor, setPrizeColor] = useState('#8b5cf6'); // violet-500
  const [winnerColor, setWinnerColor] = useState('#ec4899'); // pink-500
  const [luckyNumberBgColor, setLuckyNumberBgColor] = useState('#f3e8ff'); // violet-100
  const [winnerBgColor, setWinnerBgColor] = useState('#fdf2f8'); // pink-100
  const [cardBgColor, setCardBgColor] = useState('#ffffff');
  
  // Text customization
  const [appTitle, setAppTitle] = useState('Lucky Draw – NAC Studio');
  const [appSubtitle, setAppSubtitle] = useState('Chương trình quay số may mắn');
  const [luckyNumberLabel, setLuckyNumberLabel] = useState('Số may mắn');
  const [winnerLabel, setWinnerLabel] = useState('Người chiến thắng');
  const [drawButtonText, setDrawButtonText] = useState('Quay số');
  const [drawingText, setDrawingText] = useState('Đang quay...');

  // Settings collapsible state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const startDrawing = () => {
    const availableUsers = users.filter(user => 
      !prizes.some(prize => prize.winners.includes(user.name))
    );
    
    if (availableUsers.length === 0) {
      toast.error('Không còn người dùng nào để quay thưởng!');
      return;
    }
    
    if (currentPrize.winners.length >= currentPrize.quantity) {
      toast.error('Giải thưởng này đã hết!');
      return;
    }
    
    setIsDrawing(true);
    setWinnerName('');
    
    // Animated number spinning
    let counter = 0;
    const interval = setInterval(() => {
      setLuckyNumber(Math.floor(Math.random() * 1000).toString().padStart(3, '0'));
      counter++;
      
      if (counter > 30) {
        clearInterval(interval);
        
        // Select random winner
        const randomIndex = Math.floor(Math.random() * availableUsers.length);
        const winner = availableUsers[randomIndex];
        
        setLuckyNumber((randomIndex + 1).toString().padStart(3, '0'));
        setWinnerName(winner.name);
        setIsDrawing(false);
        
        // Update prize winners
        const updatedPrizes = prizes.map(prize => 
          prize.id === currentPrize.id 
            ? { ...prize, winners: [...prize.winners, winner.name] }
            : prize
        );
        setPrizes(updatedPrizes);
        
        const updatedCurrentPrize = updatedPrizes.find(p => p.id === currentPrize.id);
        if (updatedCurrentPrize) {
          setCurrentPrize(updatedCurrentPrize);
        }
        
        // Show confetti if prize is complete
        if (updatedCurrentPrize && updatedCurrentPrize.winners.length >= updatedCurrentPrize.quantity) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
          toast.success(`🎉 Hoàn thành ${currentPrize.name}!`);
        } else {
          toast.success(`🎊 Chúc mừng ${winner.name}!`);
        }
      }
    }, 100);
  };
  
  const exportResults = () => {
    const results = prizes
      .filter(prize => prize.winners.length > 0)
      .map(prize => `${prize.name}:\n${prize.winners.map((winner, index) => `${index + 1}. ${winner}`).join('\n')}`)
      .join('\n\n');
    
    const blob = new Blob([results], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ket-qua-quay-thuong.txt';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Đã xuất kết quả thành công!');
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'users' | 'prizes') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content.split('\n').filter(line => line.trim());
      
      if (type === 'users') {
        const newUsers = lines.map((line, index) => ({
          id: `user-${Date.now()}-${index}`,
          name: line.trim()
        }));
        setUsers(newUsers);
        toast.success(`Đã tải lên ${newUsers.length} người dùng!`);
      } else {
        const newPrizes = lines.map((line, index) => {
          const match = line.match(/^(.+?)\s*\((\d+)\)$/);
          if (match) {
            return {
              id: `prize-${Date.now()}-${index}`,
              name: line.trim(),
              quantity: parseInt(match[2]),
              winners: []
            };
          }
          return {
            id: `prize-${Date.now()}-${index}`,
            name: line.trim(),
            quantity: 1,
            winners: []
          };
        });
        setPrizes(newPrizes);
        if (newPrizes.length > 0) {
          setCurrentPrize(newPrizes[0]);
        }
        toast.success(`Đã tải lên ${newPrizes.length} giải thưởng!`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div 
      className="min-h-screen p-6 transition-all duration-500"
      style={{ backgroundColor, fontFamily }}
    >
      {showConfetti && <ConfettiEffect />}
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2 flex items-center justify-center gap-3" style={{ color: prizeColor }}>
            <Sparkles size={48} />
            {appTitle}
            <Sparkles size={48} />
          </h1>
          <p className="text-xl text-gray-600">{appSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Drawing Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Prize */}
            <Card className="backdrop-blur-sm shadow-2xl border-0 rounded-2xl overflow-hidden" style={{ backgroundColor: cardBgColor }}>
              <CardHeader className="text-center pb-4 bg-gradient-to-r from-violet-50 to-pink-50">
                <CardTitle 
                  className="text-3xl font-bold flex items-center justify-center gap-2"
                  style={{ color: prizeColor }}
                >
                  <Gift size={32} />
                  {currentPrize.name}
                </CardTitle>
                <div className="flex justify-center gap-4 mt-4">
                  <Select value={currentPrize.id} onValueChange={(value) => {
                    const prize = prizes.find(p => p.id === value);
                    if (prize) setCurrentPrize(prize);
                  }}>
                    <SelectTrigger className="w-64 bg-white/80 border-violet-200 rounded-xl shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {prizes.map(prize => (
                        <SelectItem key={prize.id} value={prize.id}>
                          {prize.name} ({prize.winners.length}/{prize.quantity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              
              <CardContent className="text-center space-y-6 p-8">
                {/* Lucky Number Display */}
                <div 
                  className="rounded-3xl p-8 shadow-inner border-2 border-violet-200"
                  style={{ backgroundColor: luckyNumberBgColor }}
                >
                  <p className="text-2xl font-semibold text-gray-600 mb-4">{luckyNumberLabel}</p>
                  <div className="text-8xl font-bold bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent font-mono tracking-wider drop-shadow-lg">
                    {luckyNumber}
                  </div>
                </div>
                
                {/* Winner Name */}
                <div 
                  className="rounded-2xl p-6 border-2 border-pink-200"
                  style={{ backgroundColor: winnerBgColor }}
                >
                  <p className="text-xl font-semibold text-gray-600 mb-2">{winnerLabel}</p>
                  <div 
                    className="text-4xl font-bold min-h-[50px] flex items-center justify-center drop-shadow-md"
                    style={{ color: winnerColor }}
                  >
                    {winnerName || '---'}
                  </div>
                </div>
                
                {/* Draw Button */}
                <Button
                  onClick={startDrawing}
                  disabled={isDrawing || currentPrize.winners.length >= currentPrize.quantity}
                  className="w-full h-16 text-2xl font-bold bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 disabled:opacity-50 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border-0"
                >
                  <Play className="mr-2" size={24} />
                  {isDrawing ? drawingText : drawButtonText}
                </Button>
              </CardContent>
            </Card>
            
            {/* Export Button */}
            <div className="flex justify-center">
              <Button
                onClick={exportResults}
                className="h-14 text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl shadow-lg border-0 px-8"
              >
                <Download className="mr-2" size={20} />
                Xuất kết quả
              </Button>
            </div>
          </div>
          
          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Winners List */}
            <WinnersList 
              currentPrize={currentPrize} 
              allPrizes={prizes}
              winnerColor={winnerColor}
              cardBgColor={cardBgColor}
            />
          </div>
        </div>

        {/* Settings Section - Collapsible */}
        <div className="mt-16">
          <Collapsible open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-2 border-gray-200 rounded-xl shadow-lg transition-all duration-300"
              >
                <Settings className="mr-3" size={24} />
                Cài đặt
                <ChevronDown 
                  className={`ml-3 transition-transform duration-300 ${isSettingsOpen ? 'rotate-180' : ''}`} 
                  size={24} 
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Customization */}
                <Card className="backdrop-blur-sm shadow-lg border-0 rounded-xl" style={{ backgroundColor: cardBgColor }}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings size={20} />
                      Tùy chỉnh nhanh
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Màu nền</Label>
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-full h-10 rounded-lg border-2 border-gray-200 cursor-pointer"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">Màu thẻ</Label>
                      <input
                        type="color"
                        value={cardBgColor}
                        onChange={(e) => setCardBgColor(e.target.value)}
                        className="w-full h-10 rounded-lg border-2 border-gray-200 cursor-pointer"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">Màu giải</Label>
                      <input
                        type="color"
                        value={prizeColor}
                        onChange={(e) => setPrizeColor(e.target.value)}
                        className="w-full h-10 rounded-lg border-2 border-gray-200 cursor-pointer"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">Font chữ</Label>
                      <Select value={fontFamily} onValueChange={setFontFamily}>
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Poppins">Poppins</SelectItem>
                          <SelectItem value="Nunito">Nunito</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* File Upload Data Management */}
                <Card className="backdrop-blur-sm shadow-lg border-0 rounded-xl" style={{ backgroundColor: cardBgColor }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Upload size={20} />
                      Upload dữ liệu
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="users" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-violet-100 to-pink-100 rounded-lg">
                        <TabsTrigger value="users" className="data-[state=active]:bg-violet-500 data-[state=active]:text-white rounded-md">
                          <Users size={16} className="mr-1" />
                          Người dùng ({users.length})
                        </TabsTrigger>
                        <TabsTrigger value="prizes" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white rounded-md">
                          <Gift size={16} className="mr-1" />
                          Giải thưởng ({prizes.length})
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="users" className="space-y-4">
                        <div className="border-2 border-dashed border-violet-300 rounded-xl p-4 text-center bg-violet-50/50">
                          <FileText className="mx-auto mb-2 text-violet-400" size={24} />
                          <p className="text-xs text-gray-600 mb-2">Tải lên file .txt danh sách người dùng</p>
                          <input
                            type="file"
                            accept=".txt"
                            onChange={(e) => handleFileUpload(e, 'users')}
                            className="hidden"
                            id="users-file"
                          />
                          <Button asChild size="sm" className="bg-violet-500 hover:bg-violet-600 text-white border-0">
                            <label htmlFor="users-file" className="cursor-pointer">
                              <Upload size={14} className="mr-1" />
                              Chọn file
                            </label>
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">Mỗi dòng một tên người dùng</p>
                      </TabsContent>
                      
                      <TabsContent value="prizes" className="space-y-4">
                        <div className="border-2 border-dashed border-pink-300 rounded-xl p-4 text-center bg-pink-50/50">
                          <FileText className="mx-auto mb-2 text-pink-400" size={24} />
                          <p className="text-xs text-gray-600 mb-2">Tải lên file .txt danh sách giải thưởng</p>
                          <input
                            type="file"
                            accept=".txt"
                            onChange={(e) => handleFileUpload(e, 'prizes')}
                            className="hidden"
                            id="prizes-file"
                          />
                          <Button asChild size="sm" className="bg-pink-500 hover:bg-pink-600 text-white border-0">
                            <label htmlFor="prizes-file" className="cursor-pointer">
                              <Upload size={14} className="mr-1" />
                              Chọn file
                            </label>
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">Ví dụ: Giải Nhất (1), Giải Nhì (2)</p>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Text Customization */}
                <Card className="backdrop-blur-sm shadow-lg border-0 rounded-xl" style={{ backgroundColor: cardBgColor }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText size={20} />
                      Tùy chỉnh text
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <Label className="text-sm">Tiêu đề ứng dụng</Label>
                        <Input 
                          value={appTitle} 
                          onChange={(e) => setAppTitle(e.target.value)}
                          className="bg-gray-50 border-gray-200 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm">Mô tả</Label>
                        <Input 
                          value={appSubtitle} 
                          onChange={(e) => setAppSubtitle(e.target.value)}
                          className="bg-gray-50 border-gray-200 rounded-lg"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Nhãn số may mắn</Label>
                          <Input 
                            value={luckyNumberLabel} 
                            onChange={(e) => setLuckyNumberLabel(e.target.value)}
                            className="bg-gray-50 border-gray-200 rounded-lg text-sm h-8"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs">Nhãn người thắng</Label>
                          <Input 
                            value={winnerLabel} 
                            onChange={(e) => setWinnerLabel(e.target.value)}
                            className="bg-gray-50 border-gray-200 rounded-lg text-sm h-8"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Text nút quay</Label>
                          <Input 
                            value={drawButtonText} 
                            onChange={(e) => setDrawButtonText(e.target.value)}
                            className="bg-gray-50 border-gray-200 rounded-lg text-sm h-8"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs">Text đang quay</Label>
                          <Input 
                            value={drawingText} 
                            onChange={(e) => setDrawingText(e.target.value)}
                            className="bg-gray-50 border-gray-200 rounded-lg text-sm h-8"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
};

export default Index;
