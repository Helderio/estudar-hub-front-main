import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Award, Users, CalendarDays, Sparkles, BookOpen, Code, GraduationCap, MapPin } from 'lucide-react';
import { RankBadge } from '@/components/RankBadge';
import type { Rank } from '@/types';
import { RANK_INFO } from '@/types';
import { Navbar } from '@/components/Navbar';

const ranks: Rank[] = ['E', 'D', 'C', 'B', 'A', 'S'];

const features = [
  { icon: Code, title: 'Publique Projectos', description: 'Partilhe os seus projectos académicos com a comunidade universitária de Benguela.' },
  { icon: Users, title: 'Colabore', description: 'Convide colegas para participar, forme equipas e construa projectos incríveis juntos.' },
  { icon: Award, title: 'Sistema de Ranking', description: 'Projectos classificados de E a S por complexidade. Construa a sua reputação académica.' },
  { icon: CalendarDays, title: 'Eventos', description: 'Participe de hackathons, conferências e workshops nas universidades de Benguela.' },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background transition-theme">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <Sparkles size={14} /> Plataforma Académica de Benguela
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight max-w-4xl mx-auto">
              O futuro da educação <br />
              <span className="gradient-text">começa aqui</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Publique projectos, colabore com estudantes das universidades de Benguela, Lobito e Catumbela. Construa a sua reputação académica no EstudarHub.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25">
                Começar agora <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-border text-foreground font-semibold hover:bg-muted/50 transition-colors">
                Já tenho conta
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><GraduationCap size={16} className="text-primary" /> 1.000+ projectos</span>
              <span className="flex items-center gap-1.5"><Users size={16} className="text-primary" /> 4.000+ estudantes</span>
              <span className="flex items-center gap-1.5"><MapPin size={16} className="text-primary" /> Benguela, Angola</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 px-4 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Tudo que precisa</h2>
            <p className="mt-3 text-muted-foreground">Uma plataforma completa para a sua vida académica.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon size={22} className="text-primary" />
                </div>
                <h3 className="font-display font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ranking */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Sistema de Ranking</h2>
            <p className="mt-3 text-muted-foreground">Projectos classificados por nível de complexidade.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {ranks.map((rank, i) => (
              <motion.div
                key={rank}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
              >
                <RankBadge rank={rank} size="lg" showTooltip={false} />
                <div>
                  <p className="font-semibold text-foreground text-sm">{RANK_INFO[rank].label}</p>
                  <p className="text-xs text-muted-foreground">{RANK_INFO[rank].description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-8 md:p-12 rounded-2xl gradient-primary relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)]" />
            <div className="relative z-10">
              <BookOpen size={36} className="text-primary-foreground mx-auto mb-4" />
              <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-3">Pronto para começar?</h2>
              <p className="text-primary-foreground/80 mb-6">Junte-se a milhares de estudantes em Benguela e comece a construir a sua reputação académica.</p>
              <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-card text-foreground font-semibold hover:bg-card/90 transition-colors">
                Criar conta gratuita <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md gradient-primary flex items-center justify-center">
              <BookOpen size={12} className="text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-foreground">EstudarHub</span>
          </div>
          <p>© 2026 EstudarHub · Benguela, Angola. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
