import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Send, Paperclip, Upload, FileText, Image, BarChart3 } from 'lucide-react';
import { mockChatMessages } from '../data/mock';

const AIAgent = () => {
  const [messages, setMessages] = useState(mockChatMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !selectedFile) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue || `Uploaded file: ${selectedFile?.name}`,
      timestamp: new Date(),
      file: selectedFile
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setSelectedFile(null);
    setIsLoading(true);

    // Mock AI response
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: getMockAIResponse(inputValue, selectedFile),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const getMockAIResponse = (input, file) => {
    if (file) {
      if (file.type.includes('csv')) {
        return `I've analyzed your CSV file "${file.name}". I found 25 transactions totaling $3,456 in expenses and $4,200 in income. I've categorized them and added them to your accounts. Would you like me to show you a breakdown by category?`;
      } else if (file.type.includes('pdf')) {
        return `I've processed your PDF statement "${file.name}". I extracted 18 transactions from your Chase account, including your salary deposit of $5,500 and various expenses. All transactions have been added to your financial records.`;
      } else if (file.type.includes('image')) {
        return `I've analyzed the receipt image "${file.name}". I can see a purchase from Target for $47.82 on January 10th. I've categorized this as "Shopping" and added it to your Chase Checking account.`;
      }
    }

    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('spent') || lowerInput.includes('bought')) {
      return `I've recorded that transaction for you. I extracted the amount and categorized it appropriately. Your spending tracking has been updated, and I can see this fits within your usual spending patterns.`;
    } else if (lowerInput.includes('portfolio') || lowerInput.includes('assets')) {
      return `Your portfolio is performing well! Your total assets are currently $583,500, up 12.2% from last month. Your asset allocation is well-diversified with 77% in real estate, 15% in equities, and 8% split between bank accounts and crypto.`;
    } else if (lowerInput.includes('budget') || lowerInput.includes('spending')) {
      return `Based on your spending patterns, you've spent $281.29 this month across various categories. Your largest expense categories are Food & Dining ($81.00) and Utilities ($120.00). You're tracking well within your typical monthly spending range.`;
    } else {
      return `I understand you want to manage your finances better. I can help you track expenses, analyze spending patterns, manage your portfolio, and answer questions about your financial data. What specific aspect of your finances would you like to explore?`;
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="p-6 h-screen flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">AI Assistant</h1>
          <p className="text-gray-400 mt-1">Natural language financial management</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Chat Interface */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="bg-gray-900 border-gray-800 flex-1 flex flex-col">
            <CardHeader className="border-b border-gray-800">
              <CardTitle className="text-gray-100 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                AI Assistant - Online
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-100 border border-gray-700'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                        {formatTimestamp(message.timestamp)}
                      </p>
                      {message.file && (
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <FileText className="w-3 h-3" />
                          {message.file.name}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <span className="text-gray-400 text-sm ml-2">AI is typing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-800 p-4">
                {selectedFile && (
                  <div className="mb-3 flex items-center gap-2 p-2 bg-gray-800 rounded-lg border border-gray-700">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-300">{selectedFile.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedFile(null)}
                      className="ml-auto h-6 w-6 p-0 text-gray-400 hover:text-gray-200"
                    >
                      ×
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-gray-400 hover:text-gray-200"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message or ask about your finances..."
                    className="flex-1 bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() && !selectedFile}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.pdf,.png,.jpg,.jpeg"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Management Tools */}
        <div className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-100 flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText className="h-4 w-4 mr-2" />
                Upload Bank Statement
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image className="h-4 w-4 mr-2" />
                Scan Receipt
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                onClick={() => fileInputRef.current?.click()}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Import CSV Data
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-100">Example Commands</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="p-2 bg-gray-800 rounded border border-gray-700">
                  <p className="text-gray-300">"I spent $25 on lunch"</p>
                </div>
                <div className="p-2 bg-gray-800 rounded border border-gray-700">
                  <p className="text-gray-300">"Show me my spending this month"</p>
                </div>
                <div className="p-2 bg-gray-800 rounded border border-gray-700">
                  <p className="text-gray-300">"Add $2000 to my savings account"</p>
                </div>
                <div className="p-2 bg-gray-800 rounded border border-gray-700">
                  <p className="text-gray-300">"Analyze my portfolio performance"</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAgent;