
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Gift, Users, Download, Palette, Type, Play, Sparkles } from 'lucide-react';
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
  const [backgroundColor, setBackgroundColor] = useState('#fdf2f8'); // light pink
  const [fontFamily, setFontFamily] = useState('Inter');
  const [prizeColor, setPrizeColor] = useState('#ec4899'); // pink-500
  const [winnerColor, setWinnerColor] = useState('#8b5cf6'); // violet-500
  
  // Input states
  const [userInput, setUserInput] = useState('');
  const [prizeInput, setPrizeInput] = useState('');

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
  
  const parseUsers = () => {
    const lines = userInput.split('\n').filter(line => line.trim());
    const newUsers = lines.map((line, index) => ({
      id: `user-${Date.now()}-${index}`,
      name: line.trim()
    }));
    setUsers(newUsers);
    toast.success(`Đã thêm ${newUsers.length} người dùng!`);
  };
  
  const parsePrizes = () => {
    const lines = prizeInput.split('\n').filter(line => line.trim());
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
    toast.success(`Đã thêm ${newPrizes.length} giải thưởng!`);
  };

  return (
    <div 
      className="min-h-screen p-6 transition-colors duration-500"
      style={{ backgroundColor, fontFamily }}
    >
      {showConfetti && <ConfettiEffect />}
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Sparkles className="text-pink-500" size={48} />
            Lucky Draw – NAC Studio
            <Sparkles className="text-pink-500" size={48} />
          </h1>
          <p className="text-xl text-gray-600">Chương trình quay số may mắn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Drawing Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Prize */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
              <CardHeader className="text-center pb-4">
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
                    <SelectTrigger className="w-64 bg-pink-50 border-pink-200">
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
              
              <CardContent className="text-center space-y-6">
                {/* Lucky Number Display */}
                <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl p-8 shadow-inner">
                  <p className="text-2xl font-semibold text-gray-600 mb-4">Số may mắn</p>
                  <div className="text-8xl font-bold text-gradient bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent font-mono tracking-wider">
                    {luckyNumber}
                  </div>
                </div>
                
                {/* Winner Name */}
                <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl p-6">
                  <p className="text-xl font-semibold text-gray-600 mb-2">Người chiến thắng</p>
                  <div 
                    className="text-4xl font-bold min-h-[50px] flex items-center justify-center"
                    style={{ color: winnerColor }}
                  >
                    {winnerName || '---'}
                  </div>
                </div>
                
                {/* Draw Button */}
                <Button
                  onClick={startDrawing}
                  disabled={isDrawing || currentPrize.winners.length >= currentPrize.quantity}
                  className="w-full h-16 text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <Play className="mr-2" size={24} />
                  {isDrawing ? 'Đang quay...' : 'Quay số'}
                </Button>
              </CardContent>
            </Card>
            
            {/* Control Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={exportResults}
                className="h-14 text-lg bg-green-500 hover:bg-green-600 rounded-xl shadow-lg"
              >
                <Download className="mr-2" size={20} />
                Xuất kết quả
              </Button>
              
              <div className="grid grid-cols-3 gap-2">
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
                  <Label className="text-sm">Màu giải</Label>
                  <input
                    type="color"
                    value={prizeColor}
                    onChange={(e) => setPrizeColor(e.target.value)}
                    className="w-full h-10 rounded-lg border-2 border-gray-200 cursor-pointer"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Font</Label>
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
              </div>
            </div>
          </div>
          
          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Winners List */}
            <WinnersList 
              currentPrize={currentPrize} 
              allPrizes={prizes}
              winnerColor={winnerColor}
            />
            
            {/* Demo Input Areas */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users size={20} />
                  Quản lý dữ liệu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="users" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-pink-100">
                    <TabsTrigger value="users" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
                      Người dùng ({users.length})
                    </TabsTrigger>
                    <TabsTrigger value="prizes" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
                      Giải thưởng ({prizes.length})
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="users" className="space-y-3">
                    <Textarea
                      placeholder="Nhập danh sách người dùng (mỗi dòng một người)&#10;Ví dụ:&#10;Nguyễn Văn A&#10;Trần Thị B&#10;Lê Văn C"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      className="min-h-[120px] bg-pink-50 border-pink-200"
                    />
                    <Button onClick={parseUsers} className="w-full bg-pink-500 hover:bg-pink-600">
                      Cập nhật danh sách
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="prizes" className="space-y-3">
                    <Textarea
                      placeholder="Nhập danh sách giải thưởng (mỗi dòng một giải)&#10;Ví dụ:&#10;Giải Nhất (1)&#10;Giải Nhì (2)&#10;Giải Ba (3)"
                      value={prizeInput}
                      onChange={(e) => setPrizeInput(e.target.value)}
                      className="min-h-[120px] bg-purple-50 border-purple-200"
                    />
                    <Button onClick={parsePrizes} className="w-full bg-purple-500 hover:bg-purple-600">
                      Cập nhật giải thưởng
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
