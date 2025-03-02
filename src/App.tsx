import React, { useState, useEffect } from "react";

// ------------------ Custom Name Helper Functions ------------------

function getMonsterName(card: { value: number; rank?: string }) {
  if (card.rank === "J") return "Jack";
  if (card.rank === "Q") return "Queen";
  if (card.rank === "K") return "King";
  if (card.rank === "A") return "Ace";
  if (card.value === 2) return "Goblin";
  if (card.value <= 4) return "Wolf";
  if (card.value <= 6) return "Skeleton";
  if (card.value <= 8) return "Orc";
  return "Beast";
}

// ------------------ Image Dictionaries ------------------
const potionImages: Record<number, string> = {
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

function getPotionImage(card: { value: number }) {
  return potionImages[card.value] || "/images/potions/default.png";
}

// ------------------ Main App Component ------------------
export default function App() {
  const [deck, setDeck] = useState<{ id: number; suit: string; rank: string; value: number; type: string }[]>([]);
  const [room, setRoom] = useState<{ id: number; suit: string; rank: string; value: number; type: string }[]>([]);
  const [currentHP, setCurrentHP] = useState<number>(20);
  const [maxHealth, setMaxHealth] = useState<number>(20);
  const [equippedWeapon, setEquippedWeapon] = useState<{ id: number; suit: string; rank: string; value: number; type: string } | null>(null);
  const [lastPotionValue, setLastPotionValue] = useState<number | null>(null);

  useEffect(() => {
    console.log("Game initialized");
  }, []);

  return (
    <div>
      <h1>Scoundrel Card Game</h1>
      <p>Current HP: {currentHP}</p>
      {room.map((card) => (
        <div key={card.id}>
          <p>{getMonsterName(card)}</p>
          <img src={getPotionImage(card)} alt="Potion" />
        </div>
      ))}
    </div>
  );
}
