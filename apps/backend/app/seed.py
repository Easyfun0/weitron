"""
種子資料匯入腳本。
使用方式： python -m app.seed ../../exam_questions_data.json

資料檔案結構（見 exam_questions_data.json）：
{
  "meta": {...},
  "groups": [
    {
      "code": "301-1",
      "title": "青椒炒肉絲、茄汁燴魚片、乾煸四季豆",
      "dishes": [{name, main_cut, method, main_ingredient, ingredients[], cooking_steps[], seasoning, notes}, ...],
      "materials": [{name, spec, qty, note?}, ...],
      "knife_work": [{material, spec, qty, note?}, ...],
      "plating_options": ["...", "...", "..."]
    },
    ...
  ]
}
"""
import json
import sys

from app.db import SessionLocal, Base, engine
from app.models import QuestionGroup, Dish, MaterialItem, KnifeWorkItem


def seed(json_path: str):
    Base.metadata.create_all(bind=engine)

    with open(json_path, encoding="utf-8") as f:
        data = json.load(f)

    groups_data = data["groups"] if isinstance(data, dict) and "groups" in data else data

    db = SessionLocal()
    created, skipped = 0, 0
    try:
        for g in groups_data:
            if db.query(QuestionGroup).filter(QuestionGroup.code == g["code"]).first():
                skipped += 1
                continue

            group = QuestionGroup(
                code=g["code"],
                title=g["title"],
                plating_options=g.get("plating_options", []),
            )
            db.add(group)
            db.flush()  # 先取得 group.id 供底下外鍵使用

            for d in g.get("dishes", []):
                db.add(
                    Dish(
                        group_id=group.id,
                        name=d["name"],
                        main_cut=d.get("main_cut"),
                        method=d.get("method"),
                        main_ingredient=d.get("main_ingredient"),
                        ingredients=d.get("ingredients", []),
                        cooking_steps=d.get("cooking_steps", []),
                        seasoning=d.get("seasoning"),
                        notes=d.get("notes"),
                    )
                )

            for m in g.get("materials", []):
                db.add(
                    MaterialItem(
                        group_id=group.id,
                        name=m["name"],
                        spec=m.get("spec"),
                        qty=m.get("qty"),
                        note=m.get("note"),
                    )
                )

            for k in g.get("knife_work", []):
                db.add(
                    KnifeWorkItem(
                        group_id=group.id,
                        material=k["material"],
                        spec=k.get("spec"),
                        qty=k.get("qty"),
                        note=k.get("note"),
                    )
                )

            created += 1

        db.commit()
        print(f"匯入完成：新增 {created} 個題組，略過已存在 {skipped} 個")
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("用法: python -m app.seed <exam_questions_data.json 路徑>")
        sys.exit(1)
    seed(sys.argv[1])
