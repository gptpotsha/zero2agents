import { describe, expect, it } from "vitest";
import { getDb, schema } from "@/lib/db";
import { createSupportTicket, replyToSupportTicket } from "@/lib/support/tickets";
import { eq } from "drizzle-orm";

describe("Support Tickets & Helpdesk System", () => {
  it("создаёт тикет поддержки и сохраняет в БД", async () => {
    const db = getDb();
    const testUserId = crypto.randomUUID();

    db.insert(schema.users)
      .values({
        id: testUserId,
        username: `student_${Date.now()}`,
        created_at: Date.now(),
      })
      .run();

    const ticketId = await createSupportTicket({
      userId: testUserId,
      source: "lesson_player",
      questionText: "Как работает команда git push -u origin master?",
      lessonId: "l04-git-branches",
    });

    expect(ticketId).toBeDefined();

    const ticket = db.select().from(schema.supportTickets).where(eq(schema.supportTickets.id, ticketId)).get();
    expect(ticket).toBeDefined();
    expect(ticket?.status).toBe("open");
    expect(ticket?.lesson_id).toBe("l04-git-branches");
  });

  it("обрабатывает ответ администратора и добавляет комментарий к уроку", async () => {
    const db = getDb();
    const studentId = crypto.randomUUID();
    const adminId = crypto.randomUUID();

    db.insert(schema.users)
      .values({
        id: studentId,
        username: `student_reply_${Date.now()}`,
        created_at: Date.now(),
      })
      .run();

    db.insert(schema.users)
      .values({
        id: adminId,
        username: `admin_test_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        role: "admin",
        created_at: Date.now(),
      })
      .run();

    const ticketId = await createSupportTicket({
      userId: studentId,
      source: "lesson_player",
      questionText: "Что такое detached HEAD?",
      lessonId: "l04-git-branches",
    });

    const replyResult = await replyToSupportTicket({
      ticketId,
      replyText: "Detached HEAD означает, что вы переключились на конкретный коммит напрямую, а не на ветку.",
      adminUserId: adminId,
    });

    expect(replyResult.ok).toBe(true);

    const updatedTicket = db
      .select()
      .from(schema.supportTickets)
      .where(eq(schema.supportTickets.id, ticketId))
      .get();

    expect(updatedTicket?.status).toBe("answered");
    expect(updatedTicket?.admin_reply).toContain("Detached HEAD");

    // Проверяем, что к уроку добавился комментарий от преподавателя
    const comments = db
      .select()
      .from(schema.lessonComments)
      .where(eq(schema.lessonComments.lesson_id, "l04-git-branches"))
      .all();

    const teacherComment = comments.find((c) => c.author_name.includes("Преподаватель"));
    expect(teacherComment).toBeDefined();
    expect(teacherComment?.content).toContain("Detached HEAD");
  });
});
