import { Link } from 'react-router-dom';
import { CalendarDays, Building2, Users, MessageCircle } from 'lucide-react';
import { RankDiamond } from '@/components/RankBadge';
import type { Rank } from '@/types';
import { RANK_INFO } from '@/types';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Logo, Lusona, WASignature } from '@/shared/ui/brand';
import { cn } from '@/lib/utils';

const ranks: Rank[] = ['E', 'D', 'C', 'B', 'A', 'S'];

const steps = [
  {
    title: 'Publique o projecto',
    text: 'Título, descrição, categoria, ligação ao repositório e o PDF do relatório, tudo numa página.',
  },
  {
    title: 'Junte a equipa',
    text: 'Convide colegas ou aceite pedidos de quem quer participar. Cada membro aparece no projecto.',
  },
  {
    title: 'Ganhe um rank',
    text: 'O projecto é classificado de E a S pela complexidade, e o seu perfil reflecte o que já construiu.',
  },
];

const more = [
  { icon: CalendarDays, title: 'Eventos', text: 'Hackathons, conferências e concursos nas instituições da província, com inscrição na própria plataforma.' },
  { icon: Building2, title: 'Instituições', text: 'Cada universidade e instituto tem a sua página, com os projectos dos seus estudantes.' },
  { icon: Users, title: 'Pessoas', text: 'Encontre colegas por curso, instituição ou área de interesse.' },
  { icon: MessageCircle, title: 'Chat', text: 'Combine o trabalho com a equipa sem sair do EstudarHub.' },
];

// Degraus da escada de ranks: cada nível sobe um pouco e cresce
const stepOffset = ['lg:mt-40', 'lg:mt-32', 'lg:mt-24', 'lg:mt-16', 'lg:mt-8', 'lg:mt-0'];
const diamondSize = ['h-9 w-9', 'h-10 w-10', 'h-11 w-11', 'h-12 w-12', 'h-14 w-14', 'h-16 w-16'];

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background transition-theme">
      <Navbar contained />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border pt-16">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
            <div>
              <h1 className="max-w-[16ch] font-display text-[40px] font-medium leading-[1.08] text-foreground md:text-[56px]">
                Os projectos académicos de Benguela, num só lugar.
              </h1>
              <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-muted-foreground">
                Publique o seu trabalho, encontre colegas para colaborar e veja cada projecto classificado, do primeiro exercício à investigação científica.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="inline-flex h-12 items-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent">
                    Ver projectos
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="inline-flex h-12 items-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent">
                      Criar conta
                    </Link>
                    <Link to="/login" className="inline-flex h-12 items-center rounded-md border border-input px-6 text-sm font-semibold text-foreground transition-colors hover:bg-secondary">
                      Entrar
                    </Link>
                  </>
                )}
              </div>
              <p className="mt-6 text-sm text-muted-foreground">Para estudantes e docentes do ensino superior em Benguela, Lobito e Catumbela.</p>
            </div>

            <figure className="relative">
              <div className="sona-dots absolute -inset-6 rounded-xl opacity-80" aria-hidden />
              <div className="relative rounded-xl border border-border bg-card/80 p-6 md:p-10">
                <Lusona cols={5} rows={3} className="w-full" strokeWidth={2.25} dotClassName="text-foreground/60" draw />
              </div>
              <figcaption className="relative mt-4 max-w-[46ch] text-xs leading-relaxed text-muted-foreground">
                Um lusona da tradição Tchokwe: uma só linha que contorna todos os pontos sem se interromper.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Como funciona — sequência real, por isso numerada */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
            <h2 className="font-display font-medium max-w-[22ch] text-[28px] leading-tight text-foreground md:text-4xl">Do repositório ao currículo em três passos.</h2>
            <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
              {steps.map((s, i) => (
                <li key={s.title} className="border-t border-foreground/80 pt-5">
                  <span className="font-mono text-sm text-primary">{i + 1}</span>
                  <h3 className="mt-3 text-lg text-foreground">{s.title}</h3>
                  <p className="mt-2 max-w-[38ch] text-[15px] leading-relaxed text-muted-foreground">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Escada de ranks */}
        <section className="border-b border-border bg-secondary/60">
          <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
            <div className="max-w-[56ch]">
              <h2 className="font-display font-medium text-[28px] leading-tight text-foreground md:text-4xl">Seis níveis, de E a S.</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                O rank diz a quem visita o projecto o que esperar dele. Um exercício de programação e uma investigação original não se medem da mesma forma.
              </p>
            </div>

            <ol className="mt-14 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-6 lg:items-start">
              {ranks.map((rank, i) => (
                <li key={rank} className={cn('flex gap-4 lg:block', stepOffset[i])}>
                  <RankDiamond rank={rank} className={cn(diamondSize[i], 'lg:mb-4')} size="lg" />
                  <div className="lg:border-l lg:border-border lg:pl-3">
                    <p className="text-sm font-semibold text-foreground">Rank {rank}</p>
                    <p className="text-sm text-foreground/80">{RANK_INFO[rank].label}</p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{RANK_INFO[rank].description}.</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Restante plataforma */}
        <section className="border-b border-border">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[0.8fr_1.2fr]">
            <h2 className="font-display font-medium max-w-[16ch] text-[28px] leading-tight text-foreground md:text-4xl">E o que acontece à volta dos projectos.</h2>
            <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {more.map((m) => (
                <div key={m.title}>
                  <dt className="flex items-center gap-2.5 font-semibold text-foreground">
                    <m.icon size={18} className="text-primary" aria-hidden />
                    {m.title}
                  </dt>
                  <dd className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{m.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Chamada final */}
        {!isAuthenticated && (
          <section>
            <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-16 md:flex-row md:items-center md:justify-between md:px-8 md:py-20">
              <h2 className="font-display font-medium max-w-[20ch] text-[28px] leading-tight text-foreground md:text-4xl">Publique o seu próximo projecto aqui.</h2>
              <Link to="/register" className="inline-flex h-12 shrink-0 items-center self-start rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent md:self-auto">
                Criar conta gratuita
              </Link>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex items-center gap-4">
            <Logo />
            <span>Benguela, Angola</span>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
            <WASignature />
            <span>© {new Date().getFullYear()} EstudarHub</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
