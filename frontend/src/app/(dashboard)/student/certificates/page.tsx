'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Award, Download, ExternalLink, Calendar, BookOpen, User, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/authStore';
import { getMyCertificates, downloadCertificateByCode, type Certificate } from '@/services/paymentService';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';
import { useUIStore } from '@/stores/uiStore';

export default function CertificatesPage() {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  
  // Fetch certificates
  const { data: certificatesData, isLoading } = useQuery({
    queryKey: ['my-certificates', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not found');
      return await getMyCertificates(user.id, { page: 0, size: 100 });
    },
    enabled: !!user?.id,
  });
  
  const certificates = certificatesData?.content || [];
  
  const handleDownload = async (certificate: Certificate) => {
    try {
      if (certificate.pdfUrl) {
        // If PDF URL is available, open in new tab
        window.open(certificate.pdfUrl, '_blank');
      } else if (certificate.certificateCode) {
        // Download by code
        const blob = await downloadCertificateByCode(certificate.certificateCode);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate-${certificate.certificateCode}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        addToast({
          type: 'success',
          description: 'Đã tải chứng chỉ thành công!',
        });
      }
    } catch (error: any) {
      console.error('Error downloading certificate:', error);
      addToast({
        type: 'error',
        description: error.response?.data?.message || 'Không thể tải chứng chỉ',
      });
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-poppins mb-2">
                Chứng chỉ của tôi
              </h1>
              <p className="text-muted-foreground">
                Xem và tải về các chứng chỉ đã đạt được
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : certificates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Award className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Chưa có chứng chỉ nào</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Hoàn thành các khóa học để nhận chứng chỉ. Chứng chỉ sẽ được cấp tự động khi bạn hoàn thành 100% khóa học.
              </p>
              <Button asChild>
                <Link href={ROUTES.COURSES}>
                  Khám phá khóa học
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <Card key={certificate.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Award className="h-6 w-6 text-yellow-500" />
                      <CardTitle className="text-lg">Chứng chỉ</CardTitle>
                    </div>
                    <Badge 
                      variant={certificate.status === 'ACTIVE' ? 'default' : 'secondary'}
                    >
                      {certificate.status === 'ACTIVE' ? 'Hoạt động' : 'Đã thu hồi'}
                    </Badge>
                  </div>
                  <CardDescription className="text-base font-semibold text-foreground">
                    {certificate.courseName || 'Khóa học'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Certificate Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span className="font-mono text-xs">{certificate.certificateCode}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Cấp ngày: {formatDate(certificate.issueDate || certificate.completionDate)}</span>
                    </div>
                    {certificate.score !== undefined && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        <span>Điểm số: {certificate.score}/100</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleDownload(certificate)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Tải về
                    </Button>
                    <Button
                      variant="outline"
                      asChild
                    >
                      <Link href={ROUTES.COURSE_DETAIL(certificate.courseId.toString())}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

