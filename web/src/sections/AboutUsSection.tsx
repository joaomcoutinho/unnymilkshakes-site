import { useMemo } from 'react'
import { WaveDivider } from '../components/WaveDivider'
import { SobreNosSection } from './SobreNosSection'
import { NossaJornada } from './NossaJornada'
import { asset } from '../lib/asset'

export function AboutUsSection() {
  const milestones = useMemo(
    () => [
      {
        id: 'm1',
        date: 'Maio 2015',
        year: '2015',
        title: 'O Começo',
        description:
          'A UNNY Milk Shakes foi constituída em 04 de Maio de 2015, com o objetivo de produzir e comercializar milk shakes, sorvetes soft, sobremesas e derivados, vindo a se tornar uma referência no setor de alimentos. Nossa primeira loja está localizada no bairro de Jardim Piedade, Jaboatão dos Guararapes – PE.',
        imageSrc: asset('/about/jornada-1.png'),
        imageAlt: 'Milk shake artesanal da UNNY',
      },
      {
        id: 'm2',
        date: 'Novembro 2015',
        year: '2015',
        title: 'Expansão',
        description:
          'Em novembro de 2015, inauguramos nosso segundo estabelecimento no Bairro de Jaboatão Centro. Continuando nosso processo de expansão, em junho de 2016 abrimos nossa terceira loja, dessa vez localizada no Bairro de Cajueiro Seco, Jaboatão dos Guararapes – PE.',
        imageSrc: asset('/about/jornada-2.png'),
        imageAlt: 'Cliente consumindo um milk shake da UNNY',
      },
      {
        id: 'm3',
        date: 'Junho 2016',
        year: '2016',
        title: 'Consolidação',
        description:
          'Com a consolidação da marca e retorno no investimento, a quarta loja foi inaugurada em Agosto 2017 em Dom Helder, Jaboatão dos Guararapes – PE.',
        imageSrc: asset('/about/jornada-3.png'),
        imageAlt: 'Interior de uma loja da UNNY Milk Shakes',
      },
    ],
    [],
  )

  // (Removed) "Os 5 Pilares da UNNY" section per request.

  return (
    <section id="sobre-nos" className="bg-white">
      {/* 1) HERO — Conheça Nossa História */}
      <div className="relative">
        <SobreNosSection imageSrc={asset('/about/historia-hero.png')} />
        <WaveDivider from="#FFED00" to="#7B2FBE" />
      </div>

      {/* 2) TIMELINE — Nossa Jornada */}
      <NossaJornada milestones={milestones} />

    </section>
  )
}
