
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Quote, RefreshCw } from "lucide-react";

const quotes = [
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney"
  },
  {
    text: "Don't be afraid to give up the good to go for the great.",
    author: "John D. Rockefeller"
  },
  {
    text: "The future depends on what you do today.",
    author: "Mahatma Gandhi"
  },
  {
    text: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins"
  },
  {
    text: "In the midst of winter, I found there was, within me, an invincible summer.",
    author: "Albert Camus"
  },
  {
    text: "You are never too old to set another goal or to dream a new dream.",
    author: "C.S. Lewis"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    text: "Life is what happens to you while you're busy making other plans.",
    author: "John Lennon"
  }
];

const QuoteOfTheDay = () => {
  const [currentQuote, setCurrentQuote] = useState(quotes[0]);

  const getQuoteOfTheDay = () => {
    const today = new Date().getDate();
    const quoteIndex = today % quotes.length;
    return quotes[quoteIndex];
  };

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setCurrentQuote(quotes[randomIndex]);
  };

  useEffect(() => {
    setCurrentQuote(getQuoteOfTheDay());
  }, []);

  return (
    <Card className="border-2 border-dashed border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Quote className="w-5 h-5 text-primary" />
            Quote of the Day
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={getRandomQuote}
            className="gap-1"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <blockquote className="border-l-4 border-primary pl-4 italic">
            <p className="text-lg leading-relaxed">"{currentQuote.text}"</p>
          </blockquote>
          <p className="text-right text-muted-foreground font-medium">
            — {currentQuote.author}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteOfTheDay;
