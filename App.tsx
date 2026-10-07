import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- DATOS TRANSFORMACIONES ---
const TRANSFORMACIONES = [
  { nombre: 'Estado Base', kiRequerido: 0, color: '#e0e0e0', emoji: '👤' },
  { nombre: 'Super Saiyajin', kiRequerido: 100, color: '#f1c40f', emoji: '👱‍♂️' },
  { nombre: 'Super Saiyajin Fase 2', kiRequerido: 300, color: '#f39c12', emoji: '⚡' },
  { nombre: 'Super Saiyajin Fase 3', kiRequerido: 600, color: '#e67e22', emoji: '🔥' },
  { nombre: 'Super Saiyajin Dios', kiRequerido: 1000, color: '#e74c3c', emoji: '🔴' },
  { nombre: 'Super Saiyajin Blue', kiRequerido: 2000, color: '#3498db', emoji: '🔵' },
  { nombre: 'Doctrina Egoísta', kiRequerido: 5000, color: '#9b59b6', emoji: '✨' },
];

// --- DATOS VILLANOS ---
const VILLANOS = [
  { id: 'freezer', nombre: 'Freezer', emoji: '👽', color: '#9b59b6' },
  { id: 'cell', nombre: 'Cell', emoji: '🦗', color: '#2ecc71' },
  { id: 'kidboo', nombre: 'Kid Boo', emoji: '😈', color: '#e84393' },
  { id: 'gokublack', nombre: 'Goku Black', emoji: '🌹', color: '#fd79a8' },
  { id: 'moro', nombre: 'Moro', emoji: '🐐', color: '#6c5ce7' },
];

// --- CARTAS MEMORIA ---
const CARTAS_BASE = ['💥', '🔥', '⚡', '🔴', '🔵', '✨'];

export default function App() {
  const [seccion, setSeccion] = useState<'pelea' | 'memoria' | 'tap' | 'wiki'>('pelea');

  // --- ESTADO TAP TAP ---
  const [ki, setKi] = useState<number>(0);
  const [maxKi, setMaxKi] = useState<number>(0);

  // --- ESTADO PELEA BOSS FIGHT ---
  const [villanoSel, setVillanoSel] = useState(VILLANOS[0]);
  const [dificultad, setDificultad] = useState<'facil' | 'normal' | 'extremo'>('normal');
  const [hpVillano, setHpVillano] = useState<number>(500);
  const [maxHpVillano, setMaxHpVillano] = useState<number>(500);
  const [hpJugador, setHpJugador] = useState<number>(100);
  const [estadoPelea, setEstadoPelea] = useState<'idle' | 'atacando' | 'esquivando' | 'ganado' | 'perdido'>('idle');
  const [mensajePelea, setMensajePelea] = useState<string>('¡Selecciona tu villano y empieza la batalla!');
  const [victorias, setVictorias] = useState<number>(0);

  // --- ESTADO MEMORIA ---
  const [cartas, setCartas] = useState<string[]>([]);
  const [volteadas, setVolteadas] = useState<number[]>([]);
  const [resueltas, setResueltas] = useState<number[]>([]);

  useEffect(() => {
    cargarDatos();
    reiniciarMemoria();
  }, []);

  const cargarDatos = async () => {
    try {
      const kiG = await AsyncStorage.getItem('@dratak_ki');
      const maxKiG = await AsyncStorage.getItem('@dratak_max_ki');
      const vicG = await AsyncStorage.getItem('@dratak_victorias');
      if (kiG !== null) setKi(parseInt(kiG, 10));
      if (maxKiG !== null) setMaxKi(parseInt(maxKiG, 10));
      if (vicG !== null) setVictorias(parseInt(vicG, 10));
    } catch (e) {
      console.error(e);
    }
  };

  // --- LÓGICA PELEA BOSS FIGHT ---
  const iniciarPelea = (v = villanoSel, dif = dificultad) => {
    let hpInicial = 500; // Normal
    if (dif === 'facil') hpInicial = 250;
    if (dif === 'extremo') hpInicial = 100;

    setVillanoSel(v);
    setDificultad(dif);
    setHpVillano(hpInicial);
    setMaxHpVillano(hpInicial);
    setHpJugador(100);
    setEstadoPelea('idle');
    setMensajePelea(`¡Inicia la pelea contra ${v.nombre}! Mantente alerta para esquivar.`);
  };

  // Bucle de ataques del villano
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (seccion === 'pelea' && (estadoPelea === 'idle' || estadoPelea === 'esquivando')) {
      const tiempoAtaque = Math.floor(Math.random() * 2000) + 1500;
      timer = setTimeout(() => {
        setEstadoPelea('atacando');
        setMensajePelea(`⚠️ ¡${villanoSel.nombre} está lanzando un golpe! ¡ESQUIVA AHORA!`);

        // Ventana para esquivar
        setTimeout(() => {
          setEstadoPelea((estadoActual) => {
            if (estadoActual === 'atacando') {
              // No esquivó a tiempo
              setHpJugador((prevHp) => {
                const nuevoHp = prevHp - 25;
                if (nuevoHp <= 0) {
                  setMensajePelea(`💀 ¡${villanoSel.nombre} te ha derrotado! Fin de la batalla.`);
                  return 0;
                }
                return nuevoHp;
              });
              setMensajePelea(`💥 ¡Recibiste un impacto directo de ${villanoSel.nombre}!`);
              return 'idle';
            }
            return estadoActual;
          });
        }, 1200);
      }, tiempoAtaque);
    }
    return () => clearTimeout(timer);
  }, [seccion, estadoPelea, villanoSel]);

  const esquivar = () => {
    if (estadoPelea === 'atacando') {
      setEstadoPelea('esquivando');
      setMensajePelea('⚡ ¡Esquive perfecto! ¡El villano quedó desprotegido, CONTRAATACA!');
    }
  };

  const contraatacar = async () => {
    if (estadoPelea === 'esquivando') {
      const daño = 50;
      const nuevoHp = Math.max(0, hpVillano - daño);
      setHpVillano(nuevoHp);

      if (nuevoHp === 0) {
        setEstadoPelea('ganado');
        setMensajePelea(`🏆 ¡DERROTASTE A ${villanoSel.nombre.toUpperCase()}! Súper victoria.`);
        const nVic = victorias + 1;
        setVictorias(nVic);
        await AsyncStorage.setItem('@dratak_victorias', nVic.toString());
      } else {
        setEstadoPelea('idle');
        setMensajePelea(`💥 ¡Contraataque exitoso! Bajas 50 de vida a ${villanoSel.nombre}.`);
      }
    }
  };

  // --- LÓGICA MEMORIA ---
  const reiniciarMemoria = () => {
    const deck = [...CARTAS_BASE, ...CARTAS_BASE].sort(() => Math.random() - 0.5);
    setCartas(deck);
    setVolteadas([]);
    setResueltas([]);
  };

  const seleccionarCarta = (index: number) => {
    if (volteadas.length === 2 || volteadas.includes(index) || resueltas.includes(index)) return;

    const nuevasVolteadas = [...volteadas, index];
    setVolteadas(nuevasVolteadas);

    if (nuevasVolteadas.length === 2) {
      const [i1, i2] = nuevasVolteadas;
      if (cartas[i1] === cartas[i2]) {
        setResueltas((prev) => [...prev, i1, i2]);
        setVolteadas([]);
      } else {
        setTimeout(() => setVolteadas([]), 800);
      }
    }
  };

  // --- LÓGICA TAP TAP ---
  const entrenarKi = async () => {
    const nKi = ki + 10;
    const nMax = Math.max(nKi, maxKi);
    setKi(nKi);
    setMaxKi(nMax);
    await AsyncStorage.setItem('@dratak_ki', nKi.toString());
    await AsyncStorage.setItem('@dratak_max_ki', nMax.toString());
  };

  const transActual = [...TRANSFORMACIONES].reverse().find((t) => ki >= t.kiRequerido) || TRANSFORMACIONES[0];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.title}>🔥 DraTak DB Suite 🔥</Text>
        <Text style={styles.subtitle}>Boss Fight, Memoria & Tap Offline</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, seccion === 'pelea' && styles.tabActive]} onPress={() => setSeccion('pelea')}>
          <Text style={styles.tabText}>🥊 Pelea</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, seccion === 'memoria' && styles.tabActive]} onPress={() => setSeccion('memoria')}>
          <Text style={styles.tabText}>🎴 Memoria</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, seccion === 'tap' && styles.tabActive]} onPress={() => setSeccion('tap')}>
          <Text style={styles.tabText}>⚡ Tap Ki</Text>
        </TouchableOpacity>
      </View>

      {/* 1. SECCIÓN PELEA BOSS FIGHT */}
      {seccion === 'pelea' && (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.secTitle}>Panel de Villanos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
            {VILLANOS.map((v) => (
              <TouchableOpacity
                key={v.id}
                style={[
                  styles.vCard,
                  villanoSel.id === v.id && { borderColor: v.color, borderWidth: 2, backgroundColor: '#2d3436' },
                ]}
                onPress={() => iniciarPelea(v, dificultad)}>
                <Text style={{ fontSize: 28 }}>{v.emoji}</Text>
                <Text style={{ color: '#fff', fontWeight: 'bold', marginTop: 4 }}>{v.nombre}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Selector de Dificultad */}
          <View style={styles.difRow}>
            <TouchableOpacity
              style={[styles.btnDif, dificultad === 'facil' && { backgroundColor: '#2ecc71' }]}
              onPress={() => iniciarPelea(villanoSel, 'facil')}>
              <Text style={styles.difText}>Fácil (250 HP)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnDif, dificultad === 'normal' && { backgroundColor: '#f39c12' }]}
              onPress={() => iniciarPelea(villanoSel, 'normal')}>
              <Text style={styles.difText}>Normal (500 HP)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnDif, dificultad === 'extremo' && { backgroundColor: '#e74c3c' }]}
              onPress={() => iniciarPelea(villanoSel, 'extremo')}>
              <Text style={styles.difText}>Extremo (100 HP)</Text>
            </TouchableOpacity>
          </View>

          {/* Arena de Batalla */}
          <View style={[styles.arenaCard, { borderColor: villanoSel.color }]}>
            <Text style={{ fontSize: 60 }}>{villanoSel.emoji}</Text>
            <Text style={[styles.vNombre, { color: villanoSel.color }]}>{villanoSel.nombre}</Text>

            {/* Barras de HP */}
            <View style={styles.hpBarContainer}>
              <Text style={styles.hpLabel}>HP Villano: {hpVillano} / {maxHpVillano}</Text>
              <View style={styles.hpBarBg}>
                <View style={[styles.hpBarFill, { width: `${(hpVillano / maxHpVillano) * 100}%`, backgroundColor: villanoSel.color }]} />
              </View>
            </View>

            <View style={styles.hpBarContainer}>
              <Text style={styles.hpLabel}>Tu Vida: {hpJugador} / 100</Text>
              <View style={styles.hpBarBg}>
                <View style={[styles.hpBarFill, { width: `${hpJugador}%`, backgroundColor: '#2ecc71' }]} />
              </View>
            </View>

            <Text style={styles.msgPelea}>{mensajePelea}</Text>

            {/* Botones de Combate */}
            <View style={styles.combateBtns}>
              <TouchableOpacity
                style={[styles.btnEsquivar, estadoPelea !== 'atacando' && { opacity: 0.5 }]}
                onPress={esquivar}
                disabled={estadoPelea !== 'atacando'}>
                <Text style={styles.btnActionText}>⚡ ESQUIVAR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnAtacar, estadoPelea !== 'esquivando' && { opacity: 0.5 }]}
                onPress={contraatacar}
                disabled={estadoPelea !== 'esquivando'}>
                <Text style={styles.btnActionText}>💥 CONTRAATACAR</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.btnReiniciarPelea} onPress={() => iniciarPelea()}>
              <Text style={{ color: '#aaa', fontSize: 12 }}>Reiniciar Pelea</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.vicCount}>🏆 Victorias Totales Guardadas: {victorias}</Text>
        </ScrollView>
      )}

      {/* 2. SECCIÓN MEMORIA */}
      {seccion === 'memoria' && (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.secTitle}>🎴 Memoria de Cartas Z</Text>
          <View style={styles.gridMemoria}>
            {cartas.map((emoji, idx) => {
              const estaVolteada = volteadas.includes(idx) || resueltas.includes(idx);
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.carta, estaVolteada && styles.cartaVolteada]}
                  onPress={() => seleccionarCarta(idx)}>
                  <Text style={{ fontSize: 28 }}>{estaVolteada ? emoji : '❓'}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity style={styles.btnResetMemoria} onPress={reiniciarMemoria}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Barajar y Reiniciar</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* 3. SECCIÓN TAP TAP */}
      {seccion === 'tap' && (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.cardTap, { borderColor: transActual.color }]}>
            <Text style={{ fontSize: 60 }}>{transActual.emoji}</Text>
            <Text style={[styles.vNombre, { color: transActual.color }]}>{transActual.nombre}</Text>
            <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>Ki: {ki} BP</Text>
            <Text style={{ color: '#888', marginBottom: 15 }}>Récord: {maxKi} BP</Text>
            <TouchableOpacity style={styles.btnTap} onPress={entrenarKi}>
              <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 18 }}>¡AUMENTAR KI! (+10)</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { padding: 16, alignItems: 'center', backgroundColor: '#1e1e1e' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#f39c12' },
  subtitle: { fontSize: 12, color: '#aaa', marginTop: 2 },
  tabBar: { flexDirection: 'row', backgroundColor: '#2a2a2a' },
  tab: { flex: 1, padding: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: '#f39c12', backgroundColor: '#333' },
  tabText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  content: { padding: 16 },
  secTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  vCard: {
    backgroundColor: '#1e1e1e',
    padding: 12,
    borderRadius: 12,
    marginRight: 10,
    alignItems: 'center',
    width: 90,
  },
  difRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  btnDif: { flex: 1, backgroundColor: '#333', padding: 8, borderRadius: 8, marginHorizontal: 3, alignItems: 'center' },
  difText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  arenaCard: { backgroundColor: '#1e1e1e', padding: 20, borderRadius: 16, alignItems: 'center', borderWidth: 2 },
  vNombre: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  hpBarContainer: { width: '100%', marginBottom: 10 },
  hpLabel: { color: '#ccc', fontSize: 12, marginBottom: 4 },
  hpBarBg: { height: 14, backgroundColor: '#333', borderRadius: 7, overflow: 'hidden' },
  hpBarFill: { height: '100%', borderRadius: 7 },
  msgPelea: { color: '#f1c40f', textAlign: 'center', marginVertical: 12, fontWeight: 'bold', fontSize: 13 },
  combateBtns: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 8 },
  btnEsquivar: { flex: 1, backgroundColor: '#3498db', padding: 12, borderRadius: 10, marginRight: 6, alignItems: 'center' },
  btnAtacar: { flex: 1, backgroundColor: '#e74c3c', padding: 12, borderRadius: 10, marginLeft: 6, alignItems: 'center' },
  btnActionText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  btnReiniciarPelea: { marginTop: 15 },
  vicCount: { color: '#2ecc71', textAlign: 'center', marginTop: 15, fontWeight: 'bold' },
  gridMemoria: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  carta: { width: 70, height: 70, backgroundColor: '#2a2a2a', borderRadius: 8, justifyContent: 'center', alignItems: 'center', margin: 6 },
  cartaVolteada: { backgroundColor: '#e67e22' },
  btnResetMemoria: { backgroundColor: '#e67e22', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  cardTap: { backgroundColor: '#1e1e1e', padding: 24, borderRadius: 16, alignItems: 'center', borderWidth: 2 },
  btnTap: { backgroundColor: '#f39c12', padding: 16, borderRadius: 30, width: '100%', alignItems: 'center' },
});