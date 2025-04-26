    const order = [];
    const orderList = document.getElementById('orderList');
    const totalPriceEl = document.getElementById('totalPrice');
    const payButton = document.getElementById('payButton');


function addToOrder(name, price) {
  const newOrderItem = {
    name: name,
    price: price,
    qty: 1
  };

  // Überprüfen, ob das Produkt bereits im Warenkorb ist
  const existingItem = order.find(item => item.name === name);
  
  if (existingItem) {
    existingItem.qty++; // Falls ja, Menge erhöhen
  } else {
    order.push(newOrderItem); // Ansonsten neues Produkt hinzufügen
  }

  renderOrder(); // Bestellliste neu rendern
}

    function renderOrder() {
      orderList.innerHTML = '';
      let total = 0;
      order.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
          ${item.qty}x ${item.name} - ${(item.qty * item.price).toFixed(2)}€
          <button onclick="increaseQty(${index})">+</button>
          <button onclick="decreaseQty(${index})">-</button>
          <button onclick="deleteItem(${index})">🗑️</button>
        `;
        orderList.appendChild(li);
        total += item.qty * item.price;
      });
      totalPriceEl.textContent = total.toFixed(2);
    }

    function increaseQty(index) {
      order[index].qty++;
      saveOrder();
      renderOrder();
    }

    function decreaseQty(index) {
      if (order[index].qty > 1) {
        order[index].qty--;
      } else {
        deleteItem(index);
        return;
      }
      saveOrder();
      renderOrder();
    }

    function deleteItem(index) {
      order.splice(index, 1);
      saveOrder();
      renderOrder();
    }

    function saveOrder() {
      localStorage.setItem('order', JSON.stringify(order));
    }

    function loadOrder() {
      const saved = localStorage.getItem('order');
      if (saved) {
        const loaded = JSON.parse(saved);
        order.push(...loaded);
        renderOrder();
      }
    }
    let cashInput = '';
//Bezahlen funktion
payButton.addEventListener('click', () => {
  if (order.length === 0) {
    alert("Keine Artikel im Warenkorb.");
    return;
  }
  cashInput = '';
  updateCashDisplay();
  document.getElementById('payModal').style.display = 'flex';
});

function addDigit(digit) {
  if (digit === ',' && cashInput.includes(',')) return;
  cashInput += digit;
  updateCashDisplay();
}

function deleteLast() {
  cashInput = cashInput.slice(0, -1);
  updateCashDisplay();
}

function quickAmount(amount) {
  cashInput = amount.toString().replace('.', ',');
  updateCashDisplay();
}

function updateCashDisplay() {
  document.getElementById('cashDisplay').textContent = cashInput || '0';
}

function closeModal() {
  document.getElementById('payModal').style.display = 'none';
  cashInput = '';
  updateCashDisplay();
}

function confirmPayment() {
  const cash = parseFloat(cashInput.replace(',', '.'));
  const total = order.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (isNaN(cash) || cash < total) {
    alert(`Bitte gültigen Betrag eingeben (mind. ${total.toFixed(2)} €)`);
    return;
  }

  const wechselgeld = cash - total;
  alert(`Gegeben: ${cash.toFixed(2)} €\nWechselgeld: ${wechselgeld.toFixed(2)} €\n\nVielen Dank!`);

  saveToDatabase(order);
  order.length = 0;
  renderOrder();
  closeModal();
}
    //payButton.addEventListener('click', () => {
      

      /*if (order.length === 0) {
        alert('Keine Bestellung vorhanden!');
        return;
      }

      const total = parseFloat(totalPriceEl.textContent);
      const gegeben = prompt(`Gesamtbetrag: ${total.toFixed(2)} €\nBitte gegebenen Betrag eingeben:`);

      if (gegeben === null) return;
      const cash = parseFloat(gegeben);

      if (isNaN(cash) || cash < total) {
        alert('Ungültiger Betrag oder zu wenig gegeben.');
        return;
      }

      const wechselgeld = cash - total;

      alert(`Gegeben: ${cash.toFixed(2)} €\nWechselgeld: ${wechselgeld.toFixed(2)} €\n\nVielen Dank für Ihren Einkauf!`);
      saveToDatabase(order);
      order.length = 0;
      saveOrder();
      saveToDatabase(order);
      renderOrder(); 
    });*/


    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
      });
    });
    function saveToDatabase(order) {
        const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        const timestamp = new Date().toLocaleString();
      
        order.forEach(item => {
          history.push({
            name: item.name,
            price: item.price.toFixed(2),
            qty: item.qty,
            total: (item.price * item.qty).toFixed(2),
            date: timestamp
          });
        });
      
        localStorage.setItem('orderHistory', JSON.stringify(history));
      }
      function showHistory() {
        const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        if (history.length === 0) {
          alert('Keine Bestellungen gespeichert.');
          return;
        }
      
        let msg = '🧾 Bestellverlauf:\n\n';
        history.forEach(entry => {
          msg += `${entry.date} - ${entry.qty}× ${entry.name} à ${entry.price} € = ${entry.total} €\n`;
        });
      
        alert(msg);
      }
      function exportToCSV() {
        const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        if (history.length === 0) {
          alert('Keine Daten zum Exportieren.');
          return;
        }
      
        const csvHeader = 'Datum,Uhrzeit,Artikelname,Einzelpreis (€),Menge,Gesamtpreis (€)\n';
        const csvRows = history.map(entry =>
          `${entry.date},"${entry.name}",${entry.price},${entry.qty},${entry.total}`
        );
      
        const csvContent = csvHeader + csvRows.join('\n');
      
        // Datei erstellen & herunterladen
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'bestellungen.csv';
        link.click();
      }
      function clearHistory() {
        const confirmDelete = confirm("Bist du sicher, dass du die gesamte Bestellhistorie löschen möchtest?");
        if (confirmDelete) {
          localStorage.removeItem('orderHistory');
          alert("Bestellverlauf wurde gelöscht.");
        }
      }

      //presi selber reinschreiben funktion
      let customInput = '';

function openCustomPriceModal() {
  customInput = '';
  updateCustomPriceDisplay();
  document.getElementById('customPriceModal').style.display = 'flex';
}

function closeCustomModal() {
  document.getElementById('customPriceModal').style.display = 'none';
  customInput = '';
  updateCustomPriceDisplay();
}

function addCustomDigit(digit) {
  if (digit === ',' && customInput.includes(',')) return;
  customInput += digit;
  updateCustomPriceDisplay();
}

function deleteCustomDigit() {
  customInput = customInput.slice(0, -1);
  updateCustomPriceDisplay();
}

function updateCustomPriceDisplay() {
  document.getElementById('customPriceDisplay').textContent = customInput || '0';
}

function confirmCustomItem() {
  const price = parseFloat(customInput.replace(',', '.'));
  if (isNaN(price) || price <= 0) {
    alert("Ungültiger Preis.");
    return;
  }

  order.push({ name: "Unbekannt", price, qty: 1 });
  renderOrder();
  closeCustomModal();
}

document.querySelectorAll('.addtoorder').forEach(button => {
  button.addEventListener('click', function() {
    const productName = this.dataset.name;
    const productPrice = parseFloat(this.dataset.price);
    
    addToOrder(productName, productPrice); // Aufruf der Funktion zum Hinzufügen der Bestellung
  });
});
  loadOrder();
