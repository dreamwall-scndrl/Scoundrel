import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./App.css";

// ------------------ Types ------------------
interface Card {
  id: number;
  suit: string;
  rank: string;
  value: number;
  type: "monster" | "weapon" | "potion";
}

interface EquippedWeapon extends Card {
  lastMonsterKilledValue: number | null;
  slainMonsters: Card[];
}

// ------------------ Constants ------------------
const INITIAL_DECK_COUNT = 44;
const MAX_HEALTH_DEFAULT = 20;
const MAX_VISIBLE_CARDS = 4;
const CARD_OVERLAP = 10;
const ACTIONS_PER_TURN = 3;

// ------------------ Image Dictionaries ------------------
const roomBackgrounds = [
  "/images/rooms/room1.webp",
  "/images/rooms/room2.webp",
  "/images/rooms/room3.webp",
  "/images/rooms/room4.webp",
  "/images/rooms/room5.webp",
  "/images/rooms/room6.webp",
  "/images/rooms/room7.webp",
  "/images/rooms/room8.webp",
  "/images/rooms/room9.webp",
  "/images/rooms/room10.webp",
];

const lastRoomBackground = "/images/rooms/EXIT.webp";
const survivedBackgrounds = ["/images/survived1.webp", "/images/survived2.webp"];
const diedBackgrounds = ["/images/died1.webp", "/images/died2.webp"];

const monsterImages = {
  Goblin2_spades: "/images/monsters/goblin2_spades.png",
  Goblin2_clubs: "/images/monsters/goblin2_clubs.png",
  Wolf3_spades: "/images/monsters/wolf3_spades.png",
  Wolf3_clubs: "/images/monsters/wolf3_clubs.png",
  Wolf4_spades: "/images/monsters/wolf4_spades.png",
  Wolf4_clubs: "/images/monsters/wolf4_clubs.png",
  Skeleton5_spades: "/images/monsters/skeleton5_spades.png",
  Skeleton5_clubs: "/images/monsters/skeleton5_clubs.png",
  Skeleton6_spades: "/images/monsters/skeleton6_spades.png",
  Skeleton6_clubs: "/images/monsters/skeleton6_clubs.png",
  Orc7_spades: "/images/monsters/orc7_spades.png",
  Orc7_clubs: "/images/monsters/orc7_clubs.png",
  Orc8_spades: "/images/monsters/orc8_spades.png",
  Orc8_clubs: "/images/monsters/orc8_clubs.png",
  Beast9_spades: "/images/monsters/beast9_spades.png",
  Beast9_clubs: "/images/monsters/beast9_clubs.png",
  Beast10_spades: "/images/monsters/beast10_spades.png",
  Beast10_clubs: "/images/monsters/beast10_clubs.png",
  Jack_spades: "/images/monsters/jack_spades.png",
  Jack_clubs: "/images/monsters/jack_clubs.png",
  Queen_spades: "/images/monsters/queen_spades.png",
  Queen_clubs: "/images/monsters/queen_clubs.png",
  King_spades: "/images/monsters/king_spades.png",
  King_clubs: "/images/monsters/king_clubs.png",
};

const weaponImages = {
  2: "/images/weapons/dagger2.png",
  3: "/images/weapons/dagger3.png",
  4: "/images/weapons/shortsword4.png",
  5: "/images/weapons/shortsword5.png",
  6: "/images/weapons/longsword6.png",
  7: "/images/weapons/longsword7.png",
  8: "/images/weapons/longsword8.png",
  9: "/images/weapons/greatsword9.png",
  10: "/images/weapons/greatsword10.png",
  noweaponequipped: "/images/weapons/noweaponequipped.png",
};

const potionImages = {
  2: "/images/potions/minipotion2.png",
  3: "/images/potions/minipotion3.png",
  4: "/images/potions/potion4.png",
  5: "/images/potions/potion5.png",
  6: "/images/potions/potion6.png",
  7: "/images/potions/potion7.png",
  8: "/images/potions/potion8.png",
  9: "/images/potions/largepotion9.png",
  10: "/images/potions/largepotion10.png",
};

// ------------------ Helper Functions ------------------
const getMonsterName = (card: Card): string => {
  if (card.rank === "J") return "Jack";
  if (card.rank === "Q") return "Queen";
  if (card.rank === "K") return "King";
  if (card.rank === "A") return "Ace";
  
  const val = card.value;
  if (val === 2) return "Goblin";
  if (val <= 4) return "Wolf";
  if (val <= 6) return "Skeleton";
  if (val <= 8) return "Orc";
  return "Beast";
};

const getWeaponName = (card: Card): string => {
  const val = card.value;
  if (val >= 2 && val <= 3) return "Dagger";
  if (val >= 4 && val <= 5) return "Short Sword";
  if (val >= 6 && val <= 8) return "Long Sword";
  if (val >= 9 && val <= 10) return "Great Sword";
  return "Unknown Weapon";
};

const getMonsterImage = (card: Card): string => {
  if (card.rank === "A") {
    if (card.suit === "spades") return "/images/monsters/ace_spades.png";
    if (card.suit === "clubs") return "/images/monsters/ace_clubs.png";
    return "/images/monsters/ace.png";
  }
  
  if (card.rank === "J" || card.rank === "Q" || card.rank === "K") {
    const key = `${getMonsterName(card)}_${card.suit}`;
    return monsterImages[key as keyof typeof monsterImages] || "/images/monsters/default.png";
  }
  
  const baseName = getMonsterName(card);
  const key = `${baseName}${card.value}_${card.suit}`;
  return monsterImages[key as keyof typeof monsterImages] || "/images/monsters/default.png";
};

const getWeaponImage = (card: Card): string => {
  return weaponImages[card.value as keyof typeof weaponImages] || "/images/weapons/default.png";
};

const getPotionImage = (card: Card): string => {
  return potionImages[card.value as keyof typeof potionImages] || "/images/potions/default.png";
};

const getCardImage = (card: Card): string => {
  if (card.type === "monster") return getMonsterImage(card);
  if (card.type === "weapon") return getWeaponImage(card);
  if (card.type === "potion") return getPotionImage(card);
  return "/images/default.png";
};

const generateDeck = (): Card[] => {
  const deck: Card[] = [];
  const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  let id = 0;
  
  ["clubs", "spades"].forEach((suit) => {
    ranks.forEach((rank) => {
      let value;
      if (rank === "J") value = 11;
      else if (rank === "Q") value = 12;
      else if (rank === "K") value = 13;
      else if (rank === "A") value = 14;
      else value = parseInt(rank);
      deck.push({ id: id++, suit, rank, value, type: "monster" });
    });
  });
  
  ["diamonds"].forEach((suit) => {
    ranks.slice(0, 9).forEach((rank) => {
      let value = parseInt(rank);
      deck.push({ id: id++, suit, rank, value, type: "weapon" });
    });
  });
  
  ["hearts"].forEach((suit) => {
    ranks.slice(0, 9).forEach((rank) => {
      let value = parseInt(rank);
      deck.push({ id: id++, suit, rank, value, type: "potion" });
    });
  });
  
  return deck;
};

const shuffleDeck = (deck: Card[]): Card[] => {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const getRandomBackground = (backgroundArray: string[]): string => {
  const randomIndex = Math.floor(Math.random() * backgroundArray.length);
  return backgroundArray[randomIndex];
};

// ------------------ Main App Component ------------------
export default function App() {
  // State declarations
  const [deck, setDeck] = useState<Card[]>([]);
  const [room, setRoom] = useState<Card[]>([]);
  const [maxHealth, setMaxHealth] = useState(MAX_HEALTH_DEFAULT);
  const [currentHP, setCurrentHP] = useState(maxHealth);
  const [equippedWeapon, setEquippedWeapon] = useState<EquippedWeapon | null>(null);
  const [turnActionCount, setTurnActionCount] = useState(0);
  const [usedPotionThisTurn, setUsedPotionThisTurn] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [fleeUsed, setFleeUsed] = useState(false);
  const [isFirstRoom, setIsFirstRoom] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [lastPotionValue, setLastPotionValue] = useState<number | null>(null);
  const [roomBackground, setRoomBackground] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [tempMaxHealth, setTempMaxHealth] = useState(maxHealth);

  // Memoized values
  const visibleCount = useMemo(() => Math.min(deck.length, MAX_VISIBLE_CARDS), [deck.length]);
  const displayDeck = useMemo(() => 
    deck.length > MAX_VISIBLE_CARDS ? deck.slice(deck.length - MAX_VISIBLE_CARDS) : deck,
    [deck]
  );
  const extraCount = useMemo(() => 
    deck.length > MAX_VISIBLE_CARDS ? deck.length - MAX_VISIBLE_CARDS : 0,
    [deck.length]
  );

  // Initialize game
  useEffect(() => {
    if (!initialized) {
      resetGame();
    }
  }, [initialized]);

  // Update room background when a new room is drawn
  useEffect(() => {
    if (turnActionCount === 0) {
      const played = INITIAL_DECK_COUNT - (deck.length + room.length);
      const roomNumber = Math.floor(played / 4) + 1;
      
      if (gameOver && currentHP > 0) {
        setRoomBackground(getRandomBackground(survivedBackgrounds));
      } else if (roomNumber === 11) {
        setRoomBackground(lastRoomBackground);
      } else {
        setRoomBackground(getRandomBackground(roomBackgrounds));
      }
    }
  }, [deck.length, room.length, gameOver, currentHP, turnActionCount]);

  // Handle player death
  useEffect(() => {
    if (gameOver && currentHP <= 0) {
      setRoomBackground(getRandomBackground(diedBackgrounds));
    }
  }, [gameOver, currentHP]);

  // Check for game over conditions
  useEffect(() => {
    if (currentHP <= 0 && !gameOver) {
      const remainingMonsters = [...deck, ...room].filter(c => c.type === "monster");
      const sum = remainingMonsters.reduce((acc, c) => acc + c.value, 0);
      const finalScore = currentHP - sum;
      setGameOver(true);
      setMessage("You died. Score: " + finalScore);
    }
  }, [currentHP, gameOver, deck, room]);

  // Check for victory condition
  useEffect(() => {
    if (initialized && deck.length === 0 && room.length === 0 && !gameOver) {
      let finalScore;
      if (currentHP === maxHealth && lastAction === "potion" && lastPotionValue) {
        finalScore = currentHP + lastPotionValue;
      } else {
        finalScore = currentHP;
      }
      setGameOver(true);
      setMessage("You survived! Score: " + finalScore);
    }
  }, [deck.length, room.length, gameOver, currentHP, initialized, lastAction, lastPotionValue, maxHealth]);

  // Refill room from deck when needed
  useEffect(() => {
    if (deck.length > 0 && deck.length < 3 && room.length < 4) {
      const needed = 4 - room.length;
      const newCards = deck.slice(0, needed);
      setRoom(prev => [...prev, ...newCards]);
      setDeck(prev => prev.slice(newCards.length));
    }
  }, [deck, room]);

  // Reset game function
  const resetGame = useCallback(() => {
    const newDeck = shuffleDeck(generateDeck());
    setDeck(newDeck.slice(4));
    setRoom(newDeck.slice(0, 4));
    setCurrentHP(maxHealth);
    setEquippedWeapon(null);
    setTurnActionCount(0);
    setUsedPotionThisTurn(false);
    setLastAction(null);
    setGameOver(false);
    setMessage("");
    setFleeUsed(false);
    setIsFirstRoom(true);
    setInitialized(true);
    setLastPotionValue(null);
  }, [maxHealth]);

  // Refill room function
  const refillRoom = useCallback((leftover: Card[], currentDeck: Card[]) => {
    const needed = 4 - leftover.length;
    const newCards = currentDeck.slice(0, needed);
    setRoom([...leftover, ...newCards]);
    setDeck(currentDeck.slice(needed));
    setFleeUsed(false);
    setUsedPotionThisTurn(false);
  }, []);

  // Handle flee room
  const handleFleeRoom = useCallback(() => {
    if (gameOver) return;
    if (fleeUsed) {
      setMessage("Cannot flee two rooms in a row!");
      return;
    }
    const combined = [...deck, ...room];
    refillRoom([], combined);
    setTurnActionCount(0);
    setUsedPotionThisTurn(false);
    setLastAction("flee");
    setMessage("Room fled.");
    setFleeUsed(true);
  }, [gameOver, fleeUsed, deck, room, refillRoom]);

  // Process monster fight
  const processMonsterFight = useCallback((choice: string, card: Card, index: number) => {
    setIsFirstRoom(false);
    let newHP = currentHP;
    let msg = "";
    
    if (choice === "barehanded") {
      newHP -= card.value;
      msg = `Barehanded fight with ${getMonsterName(card)} (Power: ${card.value}). Took ${card.value} damage.`;
    } else if (choice === "weapon") {
      if (equippedWeapon) {
        const { value: wVal, lastMonsterKilledValue } = equippedWeapon;
        const canUse = lastMonsterKilledValue === null || card.value <= lastMonsterKilledValue;
        
        if (canUse) {
          const dmg = Math.max(0, card.value - wVal);
          newHP -= dmg;
          setEquippedWeapon(prev => ({
            ...prev!,
            lastMonsterKilledValue: card.value,
            slainMonsters: [...prev!.slainMonsters, card],
          }));
          msg = `Fought ${getMonsterName(card)} (Power: ${card.value}) with weapon. Took ${dmg} damage.`;
        } else {
          newHP -= card.value;
          msg = `${getMonsterName(card)} (Power: ${card.value}) cannot be fought with the weapon. Barehanded instead. Took ${card.value} damage.`;
        }
      } else {
        newHP -= card.value;
        msg = `No weapon equipped. Barehanded fight with ${getMonsterName(card)} (Power: ${card.value}). Took ${card.value} damage.`;
      }
    }
    
    const newRoom = [...room];
    newRoom.splice(index, 1);
    setRoom(newRoom);
    setCurrentHP(newHP);
    setMessage(msg);
    setTurnActionCount(prev => {
      const newCount = prev + 1;
      if (newCount === ACTIONS_PER_TURN) {
        refillRoom(newRoom, deck);
        return 0;
      }
      return newCount;
    });
    setLastAction("fight");
  }, [currentHP, equippedWeapon, room, deck, refillRoom]);

  // Handle card click
  const handleCardClick = useCallback((cardIndex: number) => {
    if (gameOver) return;
    
    setIsFirstRoom(false);
    const card = room[cardIndex];
    
    if (card.type === "monster") {
      processMonsterFight("weapon", card, cardIndex);
      return;
    }
    
    if (card.type === "weapon") {
      setEquippedWeapon({
        ...card,
        lastMonsterKilledValue: null,
        slainMonsters: [],
      });
      setMessage("Equipped sword.");
      setLastAction("fight");
    } else if (card.type === "potion") {
      if (!usedPotionThisTurn) {
        const newHP = Math.min(maxHealth, currentHP + card.value);
        setCurrentHP(newHP);
        setUsedPotionThisTurn(true);
        setMessage("Used potion: +" + card.value + " HP.");
        setLastAction("potion");
        setLastPotionValue(card.value);
      } else {
        setMessage("Potion discarded (already used one this round).");
      }
    }
    
    const newRoom = [...room];
    newRoom.splice(cardIndex, 1);
    setRoom(newRoom);
    setTurnActionCount(prev => {
      const newCount = prev + 1;
      if (newCount === ACTIONS_PER_TURN) {
        refillRoom(newRoom, deck);
        return 0;
      }
      return newCount;
    });
  }, [gameOver, room, usedPotionThisTurn, maxHealth, currentHP, processMonsterFight, deck, refillRoom]);

  // Handle save settings
  const handleSaveSettings = useCallback(() => {
    const newVal = tempMaxHealth || MAX_HEALTH_DEFAULT;
    setMaxHealth(newVal);
    setCurrentHP(newVal);
    setShowSettings(false);
    resetGame();
  }, [tempMaxHealth, resetGame]);

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        fontFamily: "SpaceGrotesk-VariableFont_wght",
        backgroundImage: `url(${roomBackground})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      {/* Load Fonts */}
      <style>{`
        @font-face {
          font-family: 'SpaceGrotesk-VariableFont_wght';
          src: url('/font/SpaceGrotesk-VariableFont_wght.ttf') format('truetype');
        }
        @font-face {
          font-family: 'Astloch-Bold';
          src: url('/font/Astloch-Bold.ttf') format('truetype');
        }
      `}</style>

      {/* Room Panel: a distinct panel above the bottom panel */}
      {!gameOver && (
        <div
          className="room-panel flex justify-center items-center"
          style={{ minHeight: "calc(100vh - 150px)" }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {room.map((card, idx) => {
              const isMonster = card.type === "monster";
              const fistsDamage = card.value;
              const weaponDamage =
                equippedWeapon &&
                (equippedWeapon.lastMonsterKilledValue === null ||
                  card.value <= equippedWeapon.lastMonsterKilledValue)
                  ? Math.max(0, card.value - equippedWeapon.value)
                  : "N/A";
              return (
                <div
                  key={card.id}
                  className={
                    "rounded p-1 w-40 sm:w-80 h-40 sm:h-80 " +
                    (gameOver
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer")
                  }
                  onClick={() => handleCardClick(idx)}
                >
                  <img
                    src={getCardImage(card)}
                    alt={card.type}
                    className="w-full h-32 sm:h-56 object-contain"
                  />
                  <div className="text-center mt-1">
                    {isMonster ? (
                      <p className="text-xs sm:text-sm font-bold text-white">
                        {getMonsterName(card)}
                      </p>
                    ) : null}
                    {card.type !== "potion" && (
                      <p className="text-xxs sm:text-xs text-white">
                        {isMonster
                          ? "Power: "
                          : card.type === "weapon"
                          ? "Strength: "
                          : "Value: "}
                        {card.value}
                      </p>
                    )}
                    {card.type === "potion" && (
                      <p className="text-xxs sm:text-xs text-white">
                        HP after drink:{" "}
                        {Math.min(maxHealth, currentHP + card.value)}
                      </p>
                    )}
                  </div>
                  {isMonster && !gameOver && (
                    <div className="mt-2 relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          processMonsterFight("barehanded", card, idx);
                        }}
                        className="absolute bottom-2 left-[20%] flex flex-col items-center text-base bg-white bg-opacity-70 rounded p-1"
                      >
                        <img
                          src="/images/icons/fist.png"
                          alt="Fist"
                          className="w-10 h-10"
                        />
                        <span>{fistsDamage}</span>
                      </button>
                      <div className="absolute bottom-2 right-[20%] flex flex-col items-center text-base bg-white bg-opacity-70 rounded p-1">
                        <img
                          src="/images/icons/sword.png"
                          alt="Sword"
                          className="w-10 h-10"
                        />
                        <span>{equippedWeapon ? weaponDamage : "N/A"}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Panel */}
      {!gameOver && (
        <div
          className="fixed left-0 w-full"
          style={{
            bottom: "0",
            backgroundImage: "url(/images/wood.webp)",
            backgroundSize: "cover",
          }}
        >
          {/* Top Status Bar */}
          <div
            className="flex items-center justify-center h-8"
            style={{ backgroundColor: "#301706" }}
          >
            <p className="text-white text-sm text-center">{message}</p>
            <img
              src="/images/icons/settings.png"
              alt="Settings"
              className="w-6 h-6 cursor-pointer absolute right-4 top-2"
              onClick={() => setShowSettings(true)}
              style={{ filter: "invert(1)" }}
            />
          </div>

          {/* Main Bottom Panel Content: 3 Columns */}
          <div className="flex justify-around items-center w-full px-4 py-2">
            {/* Left Column: Deck */}
            <div className="flex flex-col items-center justify-center w-1/3">
              <div className="relative w-40 h-40 sm:w-80 sm:h-80 flex justify-center">
                {displayDeck.map((card, index) => (
                  <div
                    key={index}
                    className="absolute"
                    style={{ left: `${index * CARD_OVERLAP}px`, zIndex: index }}
                  >
                    <img
                      src="/images/cardback.png"
                      alt="Card Back"
                      className="w-40 h-40 sm:w-50 sm:h-60"
                    />
                    {index === displayDeck.length - 1 && extraCount > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-[20px] font-bold">
                          +{extraCount}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Center Column: Buttons & HP */}
            <div className="flex flex-col items-center justify-center w-1/3 space-y-3">
              <div className="h-12 flex items-center">
                {isFirstRoom && !gameOver ? (
                  <button
                    onClick={resetGame}
                    className="flex items-center bg-white text-black border-2 border-blue-900 px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-base sm:text-xl"
                  >
                    <img
                      src="/images/icons/dungeon.png"
                      alt="Dungeon Icon"
                      className="w-6 h-6 mr-2"
                    />
                    Find another dungeon
                  </button>
                ) : (
                  <div style={{ height: "48px" }}></div>
                )}
              </div>
              <div className="h-12 flex items-center">
                {room.length === 4 && !fleeUsed && !gameOver ? (
                  <button
                    onClick={handleFleeRoom}
                    className="flex items-center bg-white text-black border-2 border-blue-900 px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-base sm:text-xl"
                  >
                    <img
                      src="/images/icons/flee.png"
                      alt="Flee Icon"
                      className="w-6 h-6 mr-2"
                    />
                    Flee Room
                  </button>
                ) : (
                  <div style={{ height: "48px" }}></div>
                )}
              </div>
              <div
                className="flex flex-col items-center justify-center"
                style={{
                  backgroundImage: "url('/images/hp.png')",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  width: "160px",
                  height: "150px",
                }}
              >
                <p
                  className="text-red-600 text-2xl font-extrabold m-0"
                  style={{ textShadow: "2px 2px 3px #000", lineHeight: "1" }}
                >
                  HP:
                </p>
                <p
                  className="text-red-600 text-3xl font-extrabold m-0"
                  style={{ textShadow: "2px 2px 3px #000", lineHeight: "1" }}
                >
                  {currentHP}
                </p>
              </div>
            </div>

            {/* Right Column: Equipped Weapon */}
            <div className="flex flex-col items-center justify-center w-1/3">
              <div className="relative w-40 h-40 sm:w-80 sm:h-80 flex-shrink-0">
                {equippedWeapon ? (
                  <>
                    <img
                      src={getCardImage(equippedWeapon)}
                      alt="Equipped Weapon"
                      className="w-40 h-40 sm:w-80 sm:h-80 object-contain"
                    />
                    {equippedWeapon.slainMonsters?.map((m, i) => (
                      <img
                        key={i}
                        src={getCardImage(m)}
                        alt="Slain Monster"
                        className="absolute top-0 w-40 h-40 sm:w-80 sm:h-80 object-contain"
                        style={{ left: `${(i + 1) * 10 + 30}px` }}
                      />
                    ))}
                  </>
                ) : (
                  <img
                    src="/images/weapons/noweaponequipped.png"
                    alt="No Weapon Equipped"
                    className="w-40 h-40 sm:w-60 sm:h-60 object-contain"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-[13px] text-black mt-1 pb-1">
            Original game by Zach Gage and Kurt Bieg, © 2011
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-bold mb-4">Settings</h2>
            <label className="block mb-2">
              Maximum Health:
              <input
                type="number"
                value={tempMaxHealth}
                onChange={(e) => setTempMaxHealth(Number(e.target.value))}
                className="border rounded p-1 ml-2 w-24"
              />
            </label>
            <a
              href="/images/Scoundrel_rules.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline mb-4 block"
            >
              View Scoundrel Rules
            </a>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowSettings(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End Game Overlay using Astloch-Bold */}
      {gameOver && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded shadow-lg text-center">
            <p
              className="text-4xl mb-2"
              style={{ fontFamily: "Astloch-Bold", color: "#000" }}
            >
              {currentHP > 0 ? "You Survived!" : "You Died!"}
            </p>
            <p className="text-xl font-semibold mb-4">
              Score:{" "}
              {currentHP > 0
                ? currentHP === maxHealth &&
                  lastAction === "potion" &&
                  lastPotionValue
                  ? currentHP + lastPotionValue
                  : currentHP
                : currentHP -
                  [...deck, ...room]
                    .filter((c) => c.type === "monster")
                    .reduce((acc, c) => acc + c.value, 0)}
            </p>
            <button
              onClick={resetGame}
              className="bg-green-500 text-white px-6 py-2 rounded text-lg"
            >
              Start another dungeon
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
