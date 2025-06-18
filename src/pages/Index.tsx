
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Gift, Users, Download, Upload, Play, Sparkles, Settings, Plus, Trash2, Edit, Image } from 'lucide-react';
import { toast } from 'sonner';
import ConfettiEffect from '@/components/ConfettiEffect';
import WinnersList from '@/components/WinnersList';
import * as XLSX from 'xlsx';

interface Prize {
  id: string;
  name: string;
  quantity: number;
  winners: string[];
}

interface User {
  id: string;
  name: string;
  info?: string;
}

const Index = () => {
  const [currentPrize, setCurrentPrize] = useState<Prize>({
    id: '1',
    name: 'Giải Nhì (2)',
    quantity: 2,
    winners: []
  });
  
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Nguyễn Văn A', info: 'Phòng IT' },
    { id: '2', name: 'Trần Thị B', info: 'Phòng HR' },
    { id: '3', name: 'Lê Văn C', info: 'Phòng Sales' },
    { id: '4', name: 'Phạm Thị D', info: 'Phòng Marketing' },
    { id: '5', name: 'Hoàng Văn E', info: 'Phòng Finance' }
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
  
  // Prize management states
  const [newPrizeName, setNewPrizeName] = useState('');
  const [newPrizeQuantity, setNewPrizeQuantity] = useState(1);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
  
  // Customization states
  const [backgroundColor, setBackgroundColor] = useState('#fef7ff');
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [prizeColor, setPrizeColor] = useState('#8b5cf6');
  const [winnerColor, setWinnerColor] = useState('#ec4899');
  const [luckyNumberBgColor, setLuckyNumberBgColor] = useState('#f3e8ff');
  const [winnerBgColor, setWinnerBgColor] = useState('#fdf2f8');
  const [cardBgColor, setCardBgColor] = useState('#ffffff');
  
  // Text customization
  const [appTitle, setAppTitle] = useState('Lucky Draw – NAC Studio');
  const [appTitleColor, setAppTitleColor] = useState('#8b5cf6');
  const [appSubtitle, setAppSubtitle] = useState('Chương trình quay số may mắn');
  const [appSubtitleColor, setAppSubtitleColor] = useState('#6b7280');
  const [luckyNumberLabel, setLuckyNumberLabel] = useState('Số may mắn');
  const [winnerLabel, setWinnerLabel] = useState('Người chiến thắng');
  const [drawButtonText, setDrawButtonText] = useState('Quay số');
  const [drawingText, setDrawingText] = useState('Đang quay...');

  // New state for speed control
  const [spinSpeed, setSpinSpeed] = useState(100); // milliseconds between number changes

  // Settings dialog state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Drawing interval reference
  const [drawingInterval, setDrawingInterval] = useState<NodeJS.Timeout | null>(null);

  // Keyboard event handler
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (isDrawing && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        stopDrawing();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isDrawing]);

  const stopDrawing = () => {
    if (drawingInterval) {
      clearInterval(drawingInterval);
      setDrawingInterval(null);
    }

    const availableUsers = users.filter(user => 
      !prizes.some(prize => prize.winners.includes(user.name))
    );
    
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
  };

  // Prize management functions
  const addPrize = () => {
    if (!newPrizeName.trim() || newPrizeQuantity < 1) {
      toast.error('Vui lòng nhập tên giải thưởng và số lượt quay hợp lệ!');
      return;
    }
    
    const newPrize: Prize = {
      id: Date.now().toString(),
      name: `${newPrizeName} (${newPrizeQuantity})`,
      quantity: newPrizeQuantity,
      winners: []
    };
    
    setPrizes([...prizes, newPrize]);
    setNewPrizeName('');
    setNewPrizeQuantity(1);
    toast.success('Đã thêm giải thưởng mới!');
  };

  const deletePrize = (prizeId: string) => {
    if (prizes.length <= 1) {
      toast.error('Phải có ít nhất một giải thưởng!');
      return;
    }
    
    const updatedPrizes = prizes.filter(p => p.id !== prizeId);
    setPrizes(updatedPrizes);
    
    if (currentPrize.id === prizeId) {
      setCurrentPrize(updatedPrizes[0]);
    }
    
    toast.success('Đã xóa giải thưởng!');
  };

  const startEditPrize = (prize: Prize) => {
    setEditingPrize(prize);
    const match = prize.name.match(/^(.+)\s+\((\d+)\)$/);
    if (match) {
      setNewPrizeName(match[1]);
    } else {
      setNewPrizeName(prize.name);
    }
    setNewPrizeQuantity(1);
  };

  const saveEditPrize = () => {
    if (!editingPrize || !newPrizeName.trim() || newPrizeQuantity < 1) {
      toast.error('Vui lòng nhập tên giải thưởng và số lượt quay hợp lệ!');
      return;
    }
    
    const updatedPrizes = prizes.map(p => 
      p.id === editingPrize.id 
        ? { ...p, name: `${newPrizeName} (${newPrizeQuantity})`, quantity: newPrizeQuantity }
        : p
    );
    
    setPrizes(updatedPrizes);
    
    if (currentPrize.id === editingPrize.id) {
      const updatedCurrentPrize = updatedPrizes.find(p => p.id === editingPrize.id);
      if (updatedCurrentPrize) {
        setCurrentPrize(updatedCurrentPrize);
      }
    }
    
    setEditingPrize(null);
    setNewPrizeName('');
    setNewPrizeQuantity(1);
    toast.success('Đã cập nhật giải thưởng!');
  };

  const cancelEditPrize = () => {
    setEditingPrize(null);
    setNewPrizeName('');
    setNewPrizeQuantity(1);
  };

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
    const interval = setInterval(() => {
      setLuckyNumber(Math.floor(Math.random() * 1000).toString().padStart(3, '0'));
    }, spinSpeed);
    
    setDrawingInterval(interval);
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

  const downloadTemplate = () => {
    const templateData = [
      { Number: 1, Name: 'Nguyễn Văn A', Note: 'Phòng IT' },
      { Number: 2, Name: 'Trần Thị B', Note: 'Phòng HR' },
      { Number: 3, Name: 'Lê Văn C', Note: 'Phòng Sales' },
      { Number: 4, Name: 'Phạm Thị D', Note: 'Phòng Marketing' },
      { Number: 5, Name: 'Hoàng Văn E', Note: 'Phòng Finance' }
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, 'template-nguoi-dung.xlsx');
    
    toast.success('Đã tải xuống template thành công!');
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          toast.error('File trống hoặc không đúng định dạng!');
          return;
        }
        
        const firstRow = jsonData[0] as any;
        let newUsers;
        
        if ('Number' in firstRow && 'Name' in firstRow && 'Note' in firstRow) {
          newUsers = jsonData.map((row: any) => ({
            id: row['Number']?.toString() || `user-${Date.now()}-${Math.random()}`,
            name: row['Name'] || 'Không có tên',
            info: row['Note'] || ''
          }));
        } else if ('ID' in firstRow && 'Name' in firstRow && 'Info' in firstRow) {
          newUsers = jsonData.map((row: any, index) => ({
            id: row['ID']?.toString() || `user-${Date.now()}-${index}`,
            name: row['Name'] || 'Không có tên',
            info: row['Info'] || ''
          }));
        } else {
          toast.error('File người dùng phải có các cột: Number, Name, Note hoặc ID, Name, Info!');
          return;
        }
        
        setUsers(newUsers);
        toast.success(`Đã tải lên ${newUsers.length} người dùng!`);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        toast.error('Lỗi xử lý file Excel. Vui lòng kiểm tra lại định dạng file!');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleBackgroundImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setBackgroundImage(imageUrl);
      toast.success('Đã tải lên ảnh nền thành công!');
    };
    reader.readAsDataURL(file);
  };

  const backgroundStyle = backgroundImage 
    ? { 
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    : { backgroundColor };

  return (
    <div 
      className="h-screen overflow-hidden p-6 transition-all duration-500 relative"
      style={{ ...backgroundStyle, fontFamily }}
    >
      {showConfetti && <ConfettiEffect />}
      
      {/* Settings Button - Top Right */}
      <div className="absolute top-6 right-6 z-10">
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              className="bg-white/80 hover:bg-white/90 text-gray-700 border border-gray-200 rounded-xl shadow-lg backdrop-blur-sm"
            >
              <Settings size={20} />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Settings size={24} />
                Cài đặt
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Tùy chỉnh giao diện */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Tùy chỉnh giao diện</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm">Tiêu đề ứng dụng</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={appTitle} 
                        onChange={(e) => setAppTitle(e.target.value)}
                        className="bg-gray-50 border-gray-200 rounded-lg flex-1"
                      />
                      <input
                        type="color"
                        value={appTitleColor}
                        onChange={(e) => setAppTitleColor(e.target.value)}
                        className="w-12 h-10 rounded-lg border-2 border-gray-200 cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm">Mô tả</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={appSubtitle} 
                        onChange={(e) => setAppSubtitle(e.target.value)}
                        className="bg-gray-50 border-gray-200 rounded-lg flex-1"
                      />
                      <input
                        type="color"
                        value={appSubtitleColor}
                        onChange={(e) => setAppSubtitleColor(e.target.value)}
                        className="w-12 h-10 rounded-lg border-2 border-gray-200 cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm">Font chữ</Label>
                    <Select value={fontFamily} onValueChange={setFontFamily}>
                      <SelectTrigger className="h-10 bg-gray-50 border-gray-200">
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

                  <div>
                    <Label className="text-sm">Tốc độ quay số (ms)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="50"
                        max="500"
                        step="10"
                        value={spinSpeed}
                        onChange={(e) => setSpinSpeed(parseInt(e.target.value) || 100)}
                        className="bg-gray-50 border-gray-200 rounded-lg"
                      />
                      <span className="text-sm text-gray-500">
                        {spinSpeed < 100 ? 'Nhanh' : spinSpeed > 200 ? 'Chậm' : 'Vừa'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm">Ảnh nền</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50">
                      <Image className="mx-auto mb-2 text-gray-400" size={24} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBackgroundImageUpload}
                        className="hidden"
                        id="background-image"
                      />
                      <Button asChild size="sm" variant="outline">
                        <label htmlFor="background-image" className="cursor-pointer">
                          <Upload size={14} className="mr-1" />
                          Chọn ảnh
                        </label>
                      </Button>
                      {backgroundImage && (
                        <Button 
                          onClick={() => setBackgroundImage('')}
                          size="sm" 
                          variant="outline" 
                          className="ml-2"
                        >
                          Xóa ảnh
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quản lý giải thưởng */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Gift size={20} />
                    Quản lý giải thưởng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 p-4 bg-gradient-to-r from-violet-50 to-pink-50 rounded-lg border border-violet-200">
                    <div>
                      <Label className="text-sm">Tên giải thưởng</Label>
                      <Input
                        value={newPrizeName}
                        onChange={(e) => setNewPrizeName(e.target.value)}
                        placeholder="Nhập tên giải thưởng"
                        className="bg-white border-violet-200"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Số lượt quay</Label>
                      <Input
                        type="number"
                        min="0"
                        value={newPrizeQuantity}
                        onChange={(e) => setNewPrizeQuantity(parseInt(e.target.value) || 0)}
                        className="bg-white border-violet-200"
                      />
                    </div>
                    <div className="flex gap-2">
                      {editingPrize ? (
                        <>
                          <Button 
                            onClick={saveEditPrize} 
                            size="sm" 
                            disabled={!newPrizeName.trim() || newPrizeQuantity < 1}
                            className={`${
                              !newPrizeName.trim() || newPrizeQuantity < 1
                                ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' 
                                : 'bg-green-500 hover:bg-green-600'
                            } text-white border-0`}
                          >
                            Lưu
                          </Button>
                          <Button onClick={cancelEditPrize} size="sm" variant="outline">
                            Hủy
                          </Button>
                        </>
                      ) : (
                        <Button 
                          onClick={addPrize} 
                          size="sm" 
                          disabled={!newPrizeName.trim() || newPrizeQuantity < 1}
                          className={`${
                            !newPrizeName.trim() || newPrizeQuantity < 1
                              ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' 
                              : 'bg-violet-500 hover:bg-violet-600'
                          } text-white border-0`}
                        >
                          <Plus size={16} className="mr-1" />
                          Thêm giải
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {prizes.map(prize => (
                      <div key={prize.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">{prize.name}</span>
                        <div className="flex gap-1">
                          <Button
                            onClick={() => startEditPrize(prize)}
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                          >
                            <Edit size={12} />
                          </Button>
                          <Button
                            onClick={() => deletePrize(prize.id)}
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upload người dùng */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Upload size={20} />
                    Upload người dùng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      onClick={downloadTemplate}
                      className="h-20 flex flex-col items-center justify-center bg-green-500 hover:bg-green-600 text-white border-0 text-sm"
                    >
                      <Download size={20} className="mb-1" />
                      Tải template
                    </Button>

                    <div>
                      <input
                        type="file"
                        accept=".xlsx"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="users-file"
                      />
                      <Button asChild className="h-20 w-full flex flex-col items-center justify-center bg-violet-500 hover:bg-violet-600 text-white border-0 text-sm">
                        <label htmlFor="users-file" className="cursor-pointer">
                          <Upload size={20} className="mb-1" />
                          Upload Excel
                        </label>
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-center">Hiện có {users.length} người dùng</p>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3" style={{ color: appTitleColor }}>
            <Sparkles size={36} />
            {appTitle}
            <Sparkles size={36} />
          </h1>
          <p className="text-lg" style={{ color: appSubtitleColor }}>{appSubtitle}</p>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
          {/* Main Drawing Area */}
          <div className="lg:col-span-2 flex flex-col space-y-4">
            {/* Current Prize */}
            <Card className="backdrop-blur-sm shadow-lg border-0 rounded-xl" style={{ backgroundColor: cardBgColor + 'CC' }}>
              <CardHeader className="text-center pb-3">
                <CardTitle 
                  className="text-2xl font-bold flex items-center justify-center gap-2"
                  style={{ color: prizeColor }}
                >
                  <Gift size={24} />
                  {currentPrize.name}
                </CardTitle>
                <div className="flex justify-center mt-2">
                  <Select value={currentPrize.id} onValueChange={(value) => {
                    const prize = prizes.find(p => p.id === value);
                    if (prize) setCurrentPrize(prize);
                  }}>
                    <SelectTrigger className="w-64 bg-white/80 border-violet-200 rounded-lg shadow-sm">
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
              
              <CardContent className="text-center space-y-4 p-4">
                {/* Lucky Number Display */}
                <div 
                  className="rounded-2xl p-4 shadow-inner border border-violet-200"
                  style={{ backgroundColor: luckyNumberBgColor + 'AA' }}
                >
                  <p className="text-lg font-semibold text-gray-600 mb-2">{luckyNumberLabel}</p>
                  <div className="text-5xl font-bold bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent font-mono tracking-wider">
                    {luckyNumber}
                  </div>
                </div>
                
                {/* Winner Name */}
                <div 
                  className="rounded-xl p-3 border border-pink-200"
                  style={{ backgroundColor: winnerBgColor + 'AA' }}
                >
                  <p className="text-sm font-semibold text-gray-600 mb-1">{winnerLabel}</p>
                  <div 
                    className="text-2xl font-bold min-h-[30px] flex items-center justify-center"
                    style={{ color: winnerColor }}
                  >
                    {winnerName || '---'}
                  </div>
                </div>
                
                {/* Draw Button */}
                <Button
                  onClick={startDrawing}
                  disabled={isDrawing || currentPrize.winners.length >= currentPrize.quantity}
                  className="w-full h-12 text-lg font-bold bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 disabled:opacity-50 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 border-0"
                >
                  <Play className="mr-2" size={20} />
                  {isDrawing ? `${drawingText} (Enter/Space để dừng)` : drawButtonText}
                </Button>
              </CardContent>
            </Card>
            
            {/* Export Button */}
            <div className="flex justify-center">
              <Button
                onClick={exportResults}
                className="h-12 text-base bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg shadow-lg border-0 px-6"
              >
                <Download className="mr-2" size={18} />
                Xuất kết quả
              </Button>
            </div>
          </div>
          
          {/* Right Sidebar */}
          <div className="min-h-0">
            <WinnersList 
              currentPrize={currentPrize} 
              allPrizes={prizes}
              winnerColor={winnerColor}
              cardBgColor={cardBgColor + 'CC'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
