// Sistema de Notificações Web & Mobile (Browser Notifications API)

function solicitarPermissaoNotificacoes() {
  if (!("Notification" in window)) {
    console.warn("Este navegador não suporta notificações.");
    mostrarToastFeedback("Seu navegador não suporta notificações.");
    return;
  }

  if (Notification.permission === "granted") {
    mostrarToastFeedback("As notificações já estão ativadas!");
    enviarNotificacao(
      "Focus 2k",
      "Suas notificações estão funcionando perfeitamente.",
    );
    return;
  }

  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      mostrarToastFeedback("Notificações ativadas com sucesso!");
      enviarNotificacao(
        "Focus 2k",
        "Notificações ativadas! Avisaremos você sobre o término do Pomodoro e prazos de tarefas.",
      );
    } else if (permission === "denied") {
      mostrarToastFeedback(
        "Notificações bloqueadas. Habilite nas configurações do navegador.",
      );
    } else {
      mostrarToastFeedback("Permissão de notificações pendente.");
    }
  });
}

function enviarNotificacao(titulo, corpo) {
  // Sempre exibe o toast in-app como garantia visual
  if (typeof mostrarToastFeedback === "function") {
    mostrarToastFeedback(`${titulo}: ${corpo}`);
  }

  // Se o navegador suportar e tiver permissão concedida
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(titulo, {
        body: corpo,
        icon: "iconFocus2k.png",
      });
    } catch (e) {
      console.error("Erro ao disparar notificação nativa:", e);
    }
  }
}

function verificarPrazosTarefas(tarefas) {
  if (!Array.isArray(tarefas) || tarefas.length === 0) return;

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  const hojeStr = `${ano}-${mes}-${dia}`;

  tarefas.forEach((t) => {
    if (!t.prazo || t.concluida || t.status === "concluido") return;
    const prazoStr = String(t.prazo).substring(0, 10);

    if (prazoStr === hojeStr) {
      const storageKey = `focus_notified_deadline_${t.id}_${hojeStr}`;
      if (!localStorage.getItem(storageKey)) {
        localStorage.setItem(storageKey, "true");
        enviarNotificacao(
          "Meta Vencendo Hoje!",
          `A atividade "${t.titulo || "Sem título"}" vence hoje. Conclua-a para manter seu foco em dia!`,
        );
      }
    }
  });
}
