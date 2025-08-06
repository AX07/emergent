import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Send, Paperclip, Upload, FileText, Image, BarChart3 } from 'lucide-react';
import { useAIChat } from '../hooks/useAPI';

const AIAgent = () => {
  const { messages, loading, error, sendMessage, uploadDocument } = useAIChat();
  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !selectedFile) return;

    try {
      if (selectedFile) {
        await uploadDocument(selectedFile);
        setSelectedFile(null);
      } else if (inputValue.trim()) {
        await sendMessage(inputValue);
        setInputValue('');
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      // Check file type
      const allowedTypes = [
        'text/csv', 
        'application/pdf', 
        'image/png', 
        'image/jpeg', 
        'image/jpg'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a CSV, PDF, PNG, or JPEG file');
        return;
      }
      
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

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6 h-screen flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">AI Assistant</h1>
          <p className="text-gray-400 mt-1">Natural language financial management powered by Google Gemini</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

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
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-2">👋 Welcome to FinTrack AI!</p>
                    <p className="text-gray-500 text-sm">I can help you manage your finances with natural language. Try:</p>
                    <div className="mt-4 space-y-2 text-left max-w-md mx-auto">
                      <div className="p-2 bg-gray-800 rounded text-xs text-gray-300">
                        "I spent $25 on coffee this morning"
                      </div>
                      <div className="p-2 bg-gray-800 rounded text-xs text-gray-300">
                        "Show me my spending this month"
                      </div>
                      <div className="p-2 bg-gray-800 rounded text-xs text-gray-300">
                        "Upload a CSV file with transactions"
                      </div>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
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
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
                  ))
                )}
                
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <span className="text-gray-400 text-sm ml-2">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-800 p-4">
                {selectedFile && (
                  <div className="mb-3 flex items-center gap-2 p-2 bg-gray-800 rounded-lg border border-gray-700">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-300 flex-1">{selectedFile.name}</span>
                    <span className="text-xs text-gray-400">
                      {(selectedFile.size / 1024).toFixed(1)}KB
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearSelectedFile}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-gray-200"
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
                    disabled={loading}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message or ask about your finances..."
                    className="flex-1 bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400"
                    disabled={loading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={(!inputValue.trim() && !selectedFile) || loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
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
                disabled={loading}
              >
                <FileText className="h-4 w-4 mr-2" />
                Upload Bank Statement (PDF)
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                <Image className="h-4 w-4 mr-2" />
                Scan Receipt (Image)
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Import Transaction Data (CSV)
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-100">Example Commands</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="p-2 bg-gray-800 rounded border border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors" 
                     onClick={() => setInputValue("I spent $25 on lunch today")}>
                  <p className="text-gray-300">"I spent $25 on lunch today"</p>
                </div>
                <div className="p-2 bg-gray-800 rounded border border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors"
                     onClick={() => setInputValue("Show me my spending this month")}>
                  <p className="text-gray-300">"Show me my spending this month"</p>
                </div>
                <div className="p-2 bg-gray-800 rounded border border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors"
                     onClick={() => setInputValue("I earned $500 from freelance work")}>
                  <p className="text-gray-300">"I earned $500 from freelance work"</p>
                </div>
                <div className="p-2 bg-gray-800 rounded border border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors"
                     onClick={() => setInputValue("Analyze my portfolio performance")}>
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