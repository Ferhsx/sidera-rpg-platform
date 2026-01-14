import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCharacter } from '@/contexts/CharacterContext';
import { ARCHETYPES } from '@/constants';

const WHISPERS = {
    LOW: [
        "O céu está em silêncio... por enquanto.",
        "O vento sussurra um nome que você quase reconhece.",
        "As estrelas são apenas pontos frios no vácuo.",
        "O silêncio é a única oração que resta.",
        "Você ainda consegue ouvir seus próprios batimentos."
    ],
    MID: [
        "As sombras estão se alongando sem luz.",
        "Algo roçou em sua mente e recuou com nojo.",
        "O céu parece um olho que se recusa a piscar.",
        "Sua pele parece um pouco... apertada demais.",
        "As vozes mudaram de tom. Agora elas esperam.",
        "O metal sob seus pés parece estar respirando.",
        "O vazio não está vazio. Ele está com fome."
    ],
    HIGH: {
        "Sol": [
            "QUEIME TUDO. ELES ESTÃO MENTINDO.",
            "A LUZ É A ÚNICA VERDADE.",
            "DERRETA SEUS OSSOS NA FORJA DELE.",
            "O SOL GRITA E VOCÊ É O ECO.",
            "SOMOS TODOS COMBUSTÍVEL PARA O AMANHÃ."
        ],
        "Netuno": [
            "O SANGUE DELES É SUA ÁGUA. SALVE-OS.",
            "O ABISMO É PROFUNDO, MAS ACOlhedor.",
            "SUAS MEMÓRIAS ESTÃO SE DISSOLVENDO.",
            "O SAL PURIFICA A FERIDA DA ALMA.",
            "NÃO RESISTA. AFUNDE NA VERDADE AZUL."
        ],
        "Terra": [
            "NÃO SE MOVENDO. SEJA A MONTANHA.",
            "A TERRA Pede SANGUE PARA NUTRIR AS RAÍZES.",
            "SUAS PERNAS SÃO CHUMBO. VOCÊ PERTENCE AO SOLO.",
            "AS PEDRAS CONHECEM SEUS PECADOS.",
            "O PÓ É O DESTINO DE TUDO QUE RESPIRA."
        ],
        "Lua": [
            "O REFLEXO NO ESPelho ESTÁ RINDO.",
            "A NOITE NUNCA TERMINA PARA QUEM SABE VER.",
            "TUDO É PRATEADO E FALSO.",
            "A LUA É O ROsto DE QUEM VOCÊ ESQUECEU.",
            "AS SOMBRAS SÃO O SEU ÚNICO ABRIGO REAL."
        ],
        "Mercúrio": [
            "RÁPIDO. ELES ESTÃO ATRÁS DE VOCÊ.",
            "AS VOZES CORREM MAIS QUE O VENTO.",
            "NÃO CONFIEM EM NADA QUE TOCA O CHÃO.",
            "SEU CORPO É UMA MENSAGEM ENVIADA AO VÁCUO.",
            "O TEMPO É UM PERSEGUIDOR QUE NUNCA CANSAR."
        ],
        "Marte": [
            "ESMAGUE A FRAQUEZA. ATÉ A SUA PRÓPRIA.",
            "O AÇO CANTA A CANÇÃO DA AGONIA.",
            "A GUERRA É A ÚNICA CONSTANTE.",
            "A FERRUGEM É O SANGUE DAS MÁQUINAS.",
            "A PAZ É UMA MENTIRA CONTADA POR CADÁVERES."
        ],
        "Vênus": [
            "CRIE A PERFEIÇÃO A PARTIR DO HORROR.",
            "A CARNE É APENAS ARGILA ESPERANDO SER MOLDADA.",
            "BELEZA EXISTE NO APODRECIDO.",
            "O DESEJO É UMA CORDA EM VOLTA DO SEU PESCOÇO.",
            "HARMONIA É A AUSÊNCIA DE GRITOS."
        ],
        "Saturno": [
            "O TEMPO É UMA FERIDA QUE NÃO FECHA.",
            "O DESTINO ESTÁ ESCRITO EM OSSOS QUEBRADOS.",
            "ESPERE PELO FIM, ELE SEMPRE VEM.",
            "CADA SEGUNDO É UM PREGO NO SEU CAIXÃO.",
            "A FOICE NÃO SE IMPORTA COM A ESPERANÇA."
        ],
        "Júpiter": [
            "VOCÊ É O MESTRE DE UM REINO EM RUÍNAS.",
            "ELEGÂNCIA É A MAQUIAGEM DA MORTE.",
            "A COROA PESA PORQUE É FEITA DE PECADOS.",
            "O TROVÃO É A SUA VOZ ESCONDIDA.",
            "SUA VONTADE É A ÚNICA LEI QUE IMPORTA."
        ]
    },
    ECLIPSE: {
        "Sol": [
            "EU SOU O SOL QUE DEVORA AS MÃES.",
            "NÃO HÁ SOMBRA ONDE EU QUEIMO.",
            "SUA ALMA É APENAS LUZ ESPERANDO SER SOLTA."
        ],
        "Lua": [
            "O ROSTO DA LUA ESTÁ RACHANDO. VOCÊ VÊ O QUE ESTÁ DENTRO?",
            "NÓS SOMOS TODOS PÓ DE PRATA NO VÁCUO.",
            "O SILÊNCIO É O GRITO MAIS ALTO."
        ],
        "Marte": [
            "O UNIVERSO É UM MOEDOR DE CARNE. CONTINUE GIRANDO.",
            "SANGUE É O ÚNICO ÓLEO QUE AS ESTRELAS ACEITAM.",
            "MATAR É APENAS DEVOLVER O QUE NÃO PERTENCE A NINGUÉM."
        ],
        "Terra": [
            "VOCÊ É O FERROCIMENTO DA PRÓXIMA ERA.",
            "A TERRA ESTÁ COM FOME DE VOCÊ. ACEITE O ABRAÇO.",
            "PEDRA NÃO SENTE MEDO. SEJA PEDRA."
        ],
        "Mercúrio": [
            "A VELOCIDADE DA LUZ É O LIMITE DA NOSSA PRISÃO.",
            "CADA PENSAMENTO É UMA TRAIÇÃO AO DESTINO.",
            "CORRA ATÉ QUE SEUS PÉS SE DISSOLVAM NO ESPAÇO."
        ],
        "Vênus": [
            "O HORROR É A FORMA FINAL DA BELEZA.",
            "DESPELE SUA CARNE E MOSTRE A OBRA DE ARTE.",
            "AMO-TE TANTO QUE PRECISO TE DESTRUIR."
        ],
        "Saturno": [
            "O TEMPO ACABOU. O ETERNO É AGORA.",
            "AS CORRENTES SÃO FEITAS DE SUAS PRÓPRIAS ESCOLHAS.",
            "O FIM NÃO É UM LUGAR, É UM SENTIMENTO."
        ],
        "Júpiter": [
            "A COROA ESTÁ CRAVADA NO SEU CRÂNIO.",
            "SOU O REI DE NADA E VOCÊ É MEU ÚNICO SÚDITO.",
            "SUA VONTADE É A MINHA. GRITE."
        ],
        "Netuno": [
            "NÃO HÁ AR NO ABISMO, MAS VOCÊ NÃO PRECISA MAIS RESPIRAR.",
            "O OCEANO DAS ESTRELAS É FEITO DE LÁGRIMAS ESQUECIDAS.",
            "AFUNDE. SEJA O NADA. SEJA TUDO."
        ]
    }
};

export const StarWhisper: React.FC = () => {
    const { character } = useCharacter();
    const [currentWhisper, setCurrentWhisper] = useState("");
    const [key, setKey] = useState(0); // For forcing animation

    const planet = useMemo(() => {
        const arch = ARCHETYPES.find(a => a.id === character.archetypeId);
        return arch?.planet || "Sol";
    }, [character.archetypeId]);

    const getNewWhisper = () => {
        let options: string[] = [];
        const orbit = character.orbit;

        if (orbit >= 10) {
            options = WHISPERS.ECLIPSE[planet as keyof typeof WHISPERS.ECLIPSE] || WHISPERS.HIGH[planet as keyof typeof WHISPERS.HIGH] || WHISPERS.LOW;
        } else if (orbit >= 8) {
            options = WHISPERS.HIGH[planet as keyof typeof WHISPERS.HIGH] || WHISPERS.LOW;
        } else if (orbit >= 4) {
            options = WHISPERS.MID;
        } else {
            options = WHISPERS.LOW;
        }

        const randomIndex = Math.floor(Math.random() * options.length);
        return options[randomIndex];
    };

    // Update on orbit change
    useEffect(() => {
        const next = getNewWhisper();
        if (next !== currentWhisper) {
            setCurrentWhisper(next);
            setKey(prev => prev + 1);
        }
    }, [character.orbit, planet]);

    // Update periodically (5 minutes = 300,000ms)
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentWhisper(getNewWhisper());
            setKey(prev => prev + 1);
        }, 300000);

        return () => clearInterval(interval);
    }, [planet, character.orbit]);

    return (
        <div className="h-10 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.p
                    key={key}
                    initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className={`text-[11px] font-serif uppercase tracking-[0.2em] italic text-center select-none ${character.orbit >= 8 ? 'text-rust font-bold animate-pulse' :
                        character.orbit >= 5 ? 'text-gold' : 'text-stone-500'
                        }`}
                >
                    "{currentWhisper}"
                </motion.p>
            </AnimatePresence>
        </div>
    );
};
