import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Award, Play, Target, TrendingUp, Zap } from 'lucide-react';

const Home = () => {
  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-accent-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center h-16 w-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="text-gradient">Naik Satu Level</span>
              </h1>
            </div>
            <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto">
              Platform pembelajaran digital marketing yang fokus pada Meta Ads & TikTok Ads untuk mencapai ROAS optimal
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/courses"
                className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-xl text-dark-900 bg-white hover:bg-gray-100 transition-all duration-200 shadow-lg"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Jelajahi Kursus
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-3 border-2 border-white text-lg font-medium rounded-xl text-white hover:bg-white hover:text-dark-900 transition-all duration-200"
              >
                <Zap className="h-5 w-5 mr-2" />
                Mulai Belajar
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Mengapa Memilih <span className="text-gradient">Naik Satu Level</span>?
            </h2>
            <p className="text-lg text-gray-400">
              Platform pembelajaran yang dirancang khusus untuk digital marketing dengan fokus pada hasil nyata
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center hover:scale-105 transition-transform duration-300">
              <div className="card-body">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-xl bg-primary-500/10 text-primary-400 mb-4">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  ROAS Focussed
                </h3>
                <p className="text-gray-400">
                  Pembelajaran yang fokus pada Return on Ad Spend untuk hasil yang terukur
                </p>
              </div>
            </div>

            <div className="card text-center hover:scale-105 transition-transform duration-300">
              <div className="card-body">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-xl bg-accent-500/10 text-accent-400 mb-4">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  Meta & TikTok Ads
                </h3>
                <p className="text-gray-400">
                  Spesialisasi pada platform advertising terpopuler untuk hasil maksimal
                </p>
              </div>
            </div>

            <div className="card text-center hover:scale-105 transition-transform duration-300">
              <div className="card-body">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-xl bg-green-500/10 text-green-400 mb-4">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  Sertifikat Terakreditasi
                </h3>
                <p className="text-gray-400">
                  Dapatkan sertifikat yang diakui industri setelah menyelesaikan kursus
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-dark-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="card">
              <div className="card-body">
                <div className="text-3xl font-bold text-gradient mb-2">50+</div>
                <div className="text-gray-400">Kursus Digital Marketing</div>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <div className="text-3xl font-bold text-gradient mb-2">1000+</div>
                <div className="text-gray-400">Siswa Aktif</div>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <div className="text-3xl font-bold text-gradient mb-2">15+</div>
                <div className="text-gray-400">Expert Instructor</div>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <div className="text-3xl font-bold text-gradient mb-2">95%</div>
                <div className="text-gray-400">ROAS Improvement</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="gradient-bg py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Siap untuk <span className="text-gradient">Naik Satu Level</span>?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan marketer yang telah meningkatkan ROAS mereka dengan strategi yang tepat
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-xl text-dark-900 bg-white hover:bg-gray-100 transition-all duration-200 shadow-lg"
          >
            <Zap className="h-5 w-5 mr-2" />
            Daftar Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home; 