'use client';

import React, { useEffect, useState } from 'react';
import { BookOpen, Users, GraduationCap, Star } from 'lucide-react';

interface StatsSectionProps {
  coursesCount: number;
}

interface StatItem {
  icon: React.ElementType;
  value: number | string;
  suffix: string;
  label: string;
  duration: number; // Animation duration in ms
}

export function StatsSection({ coursesCount }: StatsSectionProps) {
  const stats: StatItem[] = [
    {
      icon: BookOpen,
      value: Math.max(coursesCount, 20),
      suffix: '+',
      label: 'Khóa học',
      duration: 1500,
    },
    {
      icon: Users,
      value: 2000,
      suffix: '+',
      label: 'Học viên',
      duration: 2000,
    },
    {
      icon: GraduationCap,
      value: 10,
      suffix: '+',
      label: 'Giảng viên',
      duration: 1000,
    },
    {
      icon: Star,
      value: '4.8',
      suffix: '/5',
      label: 'Hài lòng',
      duration: 1500,
    },
  ];

  return (
    <section className="py-16 border-y bg-gradient-to-br from-muted/50 via-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} delay={index * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface StatCardProps {
  stat: StatItem;
  delay: number;
}

function StatCard({ stat, delay }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState<number | string>(0);
  const [isVisible, setIsVisible] = useState(false);
  const Icon = stat.icon;

  useEffect(() => {
    // Trigger animation when component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isVisible) return;

    if (typeof stat.value === 'number') {
      // Animate number counting
      const startValue = 0;
      const endValue = stat.value;
      const duration = stat.duration;
      const startTime = Date.now();

      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(startValue + (endValue - startValue) * easeOut);

        setDisplayValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(endValue);
        }
      };

      requestAnimationFrame(animate);
    } else {
      // For string values (like "4.8"), just set it directly
      setDisplayValue(stat.value);
    }
  }, [isVisible, stat.value, stat.duration]);

  return (
    <div className="text-center group">
      <div className="flex items-center justify-center mb-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
          <Icon className="h-7 w-7 text-primary" />
        </div>
      </div>
      <div className="text-4xl md:text-5xl font-bold text-primary mb-2 transition-all duration-300">
        {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
        <span className="text-2xl md:text-3xl">{stat.suffix}</span>
      </div>
      <div className="text-sm md:text-base text-muted-foreground font-medium">
        {stat.label}
      </div>
    </div>
  );
}

